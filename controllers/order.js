/**
 * @author son87.lengoc@gmail.com
 * Created by Ngoc Son Le.
 */

const { logger } = global;

const Order = require('../models/Order');

const createRequestToBackend = require('../util/createRequestToBackend');

async function getOrdersFromBackEnd(req, extraOptions) {

  logger.debug(`get orders from back end with params: ${(req.query) ? JSON.stringify(req.query) : undefined} and extra options: ${(extraOptions) ? JSON.stringify(extraOptions) : undefined}`);

  return new Promise((resolve, reject) => {

    let limit;

    let offset;

    let currency;

    let baseCurrency;

    let options;

    if(req.query) {

      ({
        limit,
        offset,
        currency,
        baseCurrency
      } = req.query);

      options = {
        limit,
        offset,
        currency,
        baseCurrency
      };

    }
    else{

      options = {};

    }

    if(extraOptions) {

      options = Object.assign(options, extraOptions);

    }

    options.sort = JSON.stringify(options.sort || { lastUpdatedAt: -1 }); // -1 = descending

    let url = `${process.env.BACKEND_GET_ORDER}?`;

    let optionValue;

    // eslint-disable-next-line guard-for-in
    for(const optionName in options) {

      optionValue = options[ optionName ];

      if(optionValue) {

        url += `${optionName}=${optionValue}&`;

      }

    }

    const requestToBackend = createRequestToBackend(req);

    requestToBackend.get(url, (error, response, body) => {

      if(error) {

        reject(error);

      }
      else if(body) {

        const parsedBody = JSON.parse(body);

        resolve({

          currency: options.currency,

          baseCurrency: options.baseCurrency,

          orders: parsedBody.orders || [],

          count: parsedBody.count

        });

      }
      else{

        logger.error('can not connect to backend');

        reject(new Error('Unable to get active orders'));
      }

    });

  });

}

exports.placeOrder = (req, res) => {

  logger.debug(`place Order ${JSON.stringify(req.body)}`);

  const order = Order.fromJSOn(req.body);

  const errors = order.validate(); // TODO check balance

  if(Object.keys(errors).length > 0) {

    res.json({

      errors

    });

  }
  else{

    const requestToBackend = createRequestToBackend(req);

    const options = {

      url: process.env.BACKEND_ORDER_PLACE,

      form: order.toJSON()
    };

    requestToBackend.post(options, (err, httpResponse, body) => {

      if(err) {

        res.json({

          errors: err

        });

      }
      else if(body) {

        res.json({

          createdOrder: JSON.parse(body)

        });

      }
      else{

        res.status(500)
          .send('can not connect to backend');

      }

    });

  }

};

exports.getOrdersFromBackEnd = getOrdersFromBackEnd;

exports.getOrders = (req, res) => {

  const dataPromise = getOrdersFromBackEnd(req);

  dataPromise.then((data) => {

    res.json(data);

  }, (error) => {

    res.json({

      error

    });

  });

};

async function _cancelOrder(req) {

  return new Promise((resolve, reject) => {

    if(process.env.BACKEND_ORDER_CANCEL) {

      if(req.body && req.body.orderId) {

        const requestToBackend = createRequestToBackend(req);

        const options = {

          url: process.env.BACKEND_ORDER_CANCEL,

          form: {

            orderId: req.body.orderId

          }

        };

        requestToBackend.post(options, (error) => {

          if(error) {

            reject(error);

          }
          else{

            resolve();

          }

        });

      }
      else{

        reject(new Error('orderId do not exist in request body'));

      }

    }
    else{

      reject(new Error('Url for canceling order do not exist in process.env'));

    }

  });

}

exports.cancelOrder = (req, res) => {

  logger.debug(`cancel order req.body = ${JSON.stringify(req.body)}}`);

  const resultPromise = _cancelOrder(req)
    .then(() => {

      const extraOptions = {

        offset: req.body.offset,

        limit: req.body.limit,

        currency: req.body.currency,

        baseCurrency: req.body.baseCurrency

      };

      return getOrdersFromBackEnd(req, extraOptions);

    }, (error) => {

      logger.error(error.message);

      res.json({

        error: 'Can not cancel order'

      });

    });

  resultPromise.then((data) => {

    res.json(data);

  }, (error) => {

    res.json({

      error

    });

  });
};
