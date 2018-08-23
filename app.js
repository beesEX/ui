/**
 * Module dependencies.
 */
const express = require('express');
const compression = require('compression');
const session = require('express-session');
const bodyParser = require('body-parser');
const chalk = require('chalk');
const errorHandler = require('errorhandler');
const lusca = require('lusca');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo')(session);
const flash = require('express-flash');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const expressValidator = require('express-validator');
const expressStatusMonitor = require('express-status-monitor');
const sass = require('node-sass-middleware');
const requestUUIDGenerator = require('./util/middleware/requestIdGenerator');

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load({path: '.env.example'});

/**
 * Configure a global logger
 */
global.logger = require('./config/logger');

const {logger} = global;

const WebSocketServer = require('./util/WebsocketServer');

/**
 * Controllers (route handlers).
 */
const homeController = require('./controllers/home');
const userController = require('./controllers/user');
const contactController = require('./controllers/contact');
const marketController = require('./controllers/market');
const orderController = require('./controllers/order');
const orderReplayController = require('./controllers/order-replay');

/**
 * API keys and Passport configuration.
 */
const passportConfig = require('./config/passport');

/**
 * Create Express server.
 */
const app = express();

/**
 * Connect to MongoDB.
 */
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('error', (err) => {
  logger.error(err);
  logger.warn('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
  process.exit();
});

/**
 * Express configuration.
 */
app.set('host', process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0');
app.set('port', process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(expressStatusMonitor());
app.use(compression());
app.use(sass({
  src: path.join(__dirname, 'public'), dest: path.join(__dirname, 'public')
}));

// TODO find out how to configure winston logger for expressJS
// app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressValidator());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  cookie: {maxAge: 1209600000}, // two weeks in milliseconds
  store: new MongoStore({
    url: process.env.MONGODB_URI, autoReconnect: true,
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
  if(req.path === '/api/upload' || req.xhr) { // ajax doesn't need csrf token, because you can't csrf with it
    next();
  }
  else{
    lusca.csrf()(req, res, next);
  }
});
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
app.use((req, res, next) => {
  // After successful login, redirect back to the intended page
  if(!req.user && req.path !== '/login' && req.path !== '/signup' && !req.path.match(/^\/auth/) && !req.path.match(/\./)) {
    req.session.returnTo = req.originalUrl;
  }
  else if(req.user && (req.path === '/account' || req.path.match(/^\/api/))) {
    req.session.returnTo = req.originalUrl;
  }
  next();
});
app.use(express.static(path.join(__dirname, 'public'), {maxAge: 31557600000}));
app.use(requestUUIDGenerator);

const {ROUTE_TO_MARKET_INDEX} = require('./config/routeDictionary');
/**
 * public routes, no authentication required
 */
app.get('/', homeController.index);

app.get('/login', userController.getLogin);
app.post('/login', userController.postLogin);
app.get('/logout', userController.logout);
app.get('/forgot', userController.getForgot);
app.post('/forgot', userController.postForgot);
app.get('/reset/:token', userController.getReset);
app.post('/reset/:token', userController.postReset);
app.get('/signup', userController.getSignup);
app.post('/signup', userController.postSignup);

app.get('/contact', contactController.getContact);
app.post('/contact', contactController.postContact);

/**
 * secured routes, authentication required
 */
app.get('/account', passportConfig.isAuthenticated, userController.getAccount);
app.post('/account/profile', passportConfig.isAuthenticated, userController.postUpdateProfile);
app.post('/account/password', passportConfig.isAuthenticated, userController.postUpdatePassword);
app.post('/account/delete', passportConfig.isAuthenticated, userController.postDeleteAccount);

app.get('/order-replay', passportConfig.isAuthenticated, orderReplayController.index);
app.get('/finance/status/:currency', passportConfig.isAuthenticated, orderReplayController.financeStatus);
app.post('/finance/deposit/:currency', passportConfig.isAuthenticated, orderReplayController.depositFund);

/**
 * market
 */

app.get(ROUTE_TO_MARKET_INDEX, passportConfig.isAuthenticated, marketController.index);

/**
 * order
 */

app.post('/order/place', passportConfig.isAuthenticated, orderController.placeOrder);
app.post('/order/cancel', passportConfig.isAuthenticated, orderController.cancelOrder);
app.post('/order/update', passportConfig.isAuthenticated, orderController.updateOrder);
app.get('/order/history', passportConfig.isAuthenticated, orderController.getOrders);

/**
 * Error Handler.
 */
if(process.env.NODE_ENV === 'development') {
  // only use in development
  app.use(errorHandler());
}

/**
 * Test websocket server
 */

app.get('/testWebSocket', (req, res) => {

  res.render('testWebSocket', {title: 'Test WebSocket'});

});

const webSocketServer = new WebSocketServer(process.env.WEB_SOCKET_SERVER_PORT);

webSocketServer.start().then(() => {

  marketController.handleOrderBookStateChangeEvent(webSocketServer);

});

/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
  logger.info(`${chalk.green('✓')} App is running at http://localhost:${app.get('port')} in ${app.get('env')} mode`);
  logger.log('  Press CTRL-C to stop\n');
});

/**
 * Test zeroMQ subscriber
 */

const subscribe = require('./util/zeroMQSubscriber');

subscribe('world', (message) => {

  logger.debug(`BOOM: ${message}`);

});

module.exports = app;
