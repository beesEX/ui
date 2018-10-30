const {logger} = global;

const {get, post} = require('../util/callBackend');

const {getErrorFromResponse} = require('../util/backendResponseUtil');

exports.index = (req, res) => {
  res.render('order-replay', {title: 'Order-Replay'});
};

// GET /finance/status/:currency
exports.financeStatus = (req, res) => {
  logger.info(`order-replay.js financeStatus(): retrieves finance status of ${req.params.currency} ...`);

  const options = {
    uri: `/finance/status/${req.params.currency}`,
    req
  };
  get(options).then((financeStatus) => {
    res.json(financeStatus);
  }).catch((err) => {
    res.json(err);
    res.status(500);
  });
};

// POST /finance/deposit/:currency
exports.depositFund = (req, res) => {
  logger.info(`order-replay.js depositFund(): deposit fund request of ${req.body.amount} ${req.params.currency} ...`);

  const options = {
    uri: `/finance/deposit/${req.params.currency}`,
    body: {
      amount: req.body.amount,
      currency: req.params.currency
    },
    req
  };
  post(options).then((depositTX) => {
    res.json(depositTX);
  }).catch((err) => {
    res.json(err);
    res.status(500);
  });
};

const Order = require('../models/Order');

const WebSocket = require('ws');

const uuidv4 = require('uuid/v4');

const GDAX = 'gdax';

const GEMINI = 'gemini';

const mapOfNameAndOrderReplayWebsocketAdresss = {};

mapOfNameAndOrderReplayWebsocketAdresss[GDAX] = 'wss://ws-feed.gdax.com';

mapOfNameAndOrderReplayWebsocketAdresss[GEMINI] = 'wss://api.gemini.com/v1/marketdata/btcusd';

const SIDE_BID = 'bid';

const SIDE_ASK = 'ask';

const mapOfIdAndWebSocket = {};

const processOrderPlacedEvent = (jwtToken, side, orderEvent) => {

  if(orderEvent.side === side) {

    logger.debug(`ORDER-REPLAY: ${JSON.stringify(orderEvent)}`);

    const json = {
      type: 'LIMIT',
      side: side === SIDE_ASK ? 'SELL' : 'BUY',
      currency: 'BTC',
      baseCurrency: 'USDT',
      limitPrice: orderEvent.price,
      quantity: orderEvent.delta
    };

    const order = Order.fromJSON(json);

    const options = {

      url: process.env.BACKEND_ORDER_PLACE,

      body: order,

      jwtToken

    };

    post(options);

  }

};

const processWSEvent = (jwtToken, source, side, message) => {

  switch(source) {

    case GDAX:

      if(message.type === 'received') {

        const event = {};

        event.side = message.side === 'sell' ? SIDE_ASK : SIDE_BID;

        event.price = message.price;

        event.delta = message.size;

        processOrderPlacedEvent(jwtToken, side, event);

      }

      break;

    default: // GEMINI
      if(message.type === 'update') {

        for(let i = 0; i < message.events.length; i++) {

          const event = message.events[i];

          if(event.type === 'change' && event.reason === 'place') {

            processOrderPlacedEvent(jwtToken, side, event);

          }
        }
      }
  }

};

const startOrderReplay = (jwtToken, source, side, res) => {

  logger.debug(`start order replay from: ${source}`);

  const websocketUrl = mapOfNameAndOrderReplayWebsocketAdresss[source];

  const id = uuidv4();

  const websocket = new WebSocket(websocketUrl);

  let promiseResolveFn;

  let promiseRejectFn;

  let responseAlreadySent = false;

  const promise = new Promise(((resolve, reject) => {

    promiseRejectFn = reject;

    promiseResolveFn = resolve;

  }));


  switch(source) {

    case GDAX:

      websocket.onopen = () => {

        const subscribeMessage = {

          type: 'subscribe',

          product_ids: ['BTC-USD'],

          channels: ['full']

        };

        websocket.send(JSON.stringify(subscribeMessage));

        mapOfIdAndWebSocket[id] = websocket;

        promiseResolveFn();

      };

      break;

    default:

      websocket.onopen = () => {

        mapOfIdAndWebSocket[id] = websocket;

        promiseResolveFn();

      };

  }

  websocket.onmessage = (event) => {

    const msg = JSON.parse(event.data);

    processWSEvent(jwtToken, source, side, msg);

  };

  websocket.onclose = () => {

    delete mapOfIdAndWebSocket[id];

  };

  websocket.onerror = (event) => {

    logger.error(`websocket with id ${id}: ${JSON.stringify(event)}`);

    promiseRejectFn(event);

  };

  promise.then(() => {

    res.json({

      data: {

        id,

        message: 'order replay process is successfully started'

      }
    });

    responseAlreadySent = true;

  }, (errorEvent) => {

    if(!responseAlreadySent) {

      res.json({

        error: JSON.stringify(errorEvent)

      });

      responseAlreadySent = true;

    }

  });

};

const stopOrderReplay = (id, res) => {

  logger.debug(`stop order replay with websocket id: ${id}`);

  const websocket = mapOfIdAndWebSocket[id];

  if(websocket) {

    websocket.close();

    delete mapOfIdAndWebSocket[id];

  }

  res.json({

    data: {

      result: 'OK'

    }

  });

};

exports.startOrStopOrderReplay = (req, res) => {

  logger.debug(`handle order replay request: ${JSON.stringify(req.body)}`);

  const {source, id, action, side} = req.body;

  if(action === 'start') {

    startOrderReplay(req.session.jwtToken, source, side, res);

  }
  else{

    stopOrderReplay(id, res);

  }

};

exports.reset = (req, res) => {

  logger.debug('order-replay reset');

  const options = {

    req,

    url: process.env.BACKEND_TEST_RESET

  };

  post(options).then((reponse) => {

    const errorObject = getErrorFromResponse(reponse, 'string');

    if(errorObject) {

      res.json({

        error: {

          msg: errorObject.msg

        }

      });

    }
    else{

      res.sendStatus(200);

    }

  });

};

