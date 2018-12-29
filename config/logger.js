const winston = require('winston');

const createConsoleLogger = ({isDev = false, isProd = false, isTest = false}) => {
  const transports = [];
  if (isProd) {
    transports.push(new winston.transports.Console({
      colorize: false,
      humanReadableUnhandledException: true,
      json: true,
      level: 'debug'
    }));
  }

  if (isDev) {
    transports.push(new winston.transports.Console({
      colorize: true,
      humanReadableUnhandledException: true,
      json: false,
      level: 'debug'
    }));
  }

  if (isTest) {
    transports.push(new winston.transports.Console({
      colorize: true,
      humanReadableUnhandledException: true,
      json: false,
      level: 'debug'
    }));
  }

  const logger = new winston.Logger({
    exitOnError: false,
    transports
  });

  logger.debug('[logger] Configured');

  return logger;
};


const logger = createConsoleLogger({isDev: process.env.NODE_ENV === 'development', isProd: process.env.NODE_ENV === 'production', isTest: process.env.NODE_ENV === 'test'});

const requestNamespace = require('./requestNamespace');

function createWrappedConsoleLogger() {

  const wrappedLogger = {

    log: function log(level, message) {

      if(arguments.length === 1) {

        message = level;

        level = logger.level || 'info';


      }

      wrappedLogger[ level ](message);

    }

  };

  let logLevels;

  if(logger && logger.levels) {

    logLevels = logger.levels;

  }
  else{

    logLevels = {

      debug: 4, error: 0, info: 2, silly: 5, verbose: 3, warn: 1

    };

  }

  const arrayOfLogLevel = Object.keys(logLevels);

  arrayOfLogLevel.forEach((logLevel) => {

    wrappedLogger[ logLevel ] = (message) => {

      const requestId = requestNamespace.get('requestId');

      if(requestId) {

        logger[ logLevel ](`[Request Id: ${requestId}]: ${message}`);

      }
      else{

        logger[ logLevel ](message);
      }

    };

  });

  return wrappedLogger;

}

module.exports = createWrappedConsoleLogger();
