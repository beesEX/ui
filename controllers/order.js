/**
 * @author son87.lengoc@gmail.com
 * Created by Ngoc Son Le.
 */

const { logger } = global;

const Order = require('../models/Order');

const createRequestToBackend = require('../util/createRequestToBackend');

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

        logger.warn('can not connect to backend');

        reject(new Error('Unable to get active orders'));
      }

    });

  });

}

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
