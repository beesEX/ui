/**
 * @author son87.lengoc@gmail.com
 * Created by Ngoc Son Le.
 */

const {logger} = global;

const Order = require('../models/Order');

const requestToBackEnd = require('../util/callBackend');

async function getOrdersFromBackEnd(req, extraOptions) {

  logger.bindTo(req).debug(`get orders from back end with params: ${(req.query) ? JSON.stringify(req.query) : undefined} and extra options: ${(extraOptions) ? JSON.stringify(extraOptions) : undefined}`);

  let options;

  if(req.query) {

    const {limit, offset, currency, baseCurrency} = req.query;

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

  options.sort = JSON.stringify(options.sort || {lastUpdatedAt: -1}); // -1 = descending

  let url = `${process.env.BACKEND_GET_ORDER}?`;

  let optionValue;

  // eslint-disable-next-line guard-for-in
  for(const optionName in options) {

    optionValue = options[ optionName ];

    if(optionValue) {

      url += `${optionName}=${optionValue}&`;

    }

  }

  options.url = url;

  options.req = req;

  return requestToBackEnd.get(options);

}

// POST /order/place
exports.placeOrder = (req, res) => {

  logger.bindTo(req).debug(`place Order ${JSON.stringify(req.body)}`);

  const order = Order.fromJSON(req.body);

  const errors = order.validate(); // TODO check balance

  if(Object.keys(errors).length > 0) {

    res.json({

      errors

    });

  }
  else{

    const options = {

      url: process.env.BACKEND_ORDER_PLACE,

      body: order,

      req
    };

    requestToBackEnd.post(options).then((createdOrder) => {

      if(createdOrder) {

        res.json({

          createdOrder

        });

      }
      else{

        res.status(500).send('can not connect to backend');

      }

    }, (error) => {

      res.json({

        error: error.message

      });

    });

  }

};

exports.getOrdersFromBackEnd = getOrdersFromBackEnd;

// GET /order/history
exports.getOrders = (req, res) => {

  const dataPromise = getOrdersFromBackEnd(req);

  dataPromise.then((data) => {

    res.json(data);

  }, (error) => {

    res.json({

      error: error.message

    });

  });

};

async function _cancelOrder(req) {

  if(process.env.BACKEND_ORDER_CANCEL) {

    const options = {

      url: process.env.BACKEND_ORDER_CANCEL,

      body: {

        orderId: req.body.orderId

      },

      req

    };

    return requestToBackEnd.post(options);

  }

  return Promise.reject(new Error('Url for canceling order do not exist in process.env'));

}

// POST /order/cancel
exports.cancelOrder = (req, res) => {

  logger.bindTo(req).debug(`cancel order req.body = ${JSON.stringify(req.body)}}`);

  const resultPromise = _cancelOrder(req).then((response) => {

    if(response && response.error) {

      return Promise.reject(new Error(response.error.message));

    }

    const extraOptions = {

      offset: req.body.offset,

      limit: req.body.limit,

      currency: req.body.currency,

      baseCurrency: req.body.baseCurrency

    };

    return getOrdersFromBackEnd(req, extraOptions);


  }, (error) => {

    logger.bindTo(req).error(`Can not cancel order. Reason: ${error.message}`);

    return Promise.reject(error);

  });

  resultPromise.then((data) => {

    res.json(data);

  }, (error) => {

    res.json({

      error: error.message

    });

  });
};

async function _updateOrder(req) {

  if(process.env.BACKEND_ORDER_UPDATE) {

    const options = {

      url: process.env.BACKEND_ORDER_UPDATE,

      body: req.body,

      req

    };

    return requestToBackEnd.post(options);

  }

  return Promise.reject(new Error('Url for updating order do not exist in process.env'));

}

// POST /order/update
exports.updateOrder = (req, res) => {

  logger.bindTo(req).debug(`update order req.body = ${JSON.stringify(req.body)}`);

  _updateOrder(req).then((response) => {

    if(response) {

      if(response.error) {

        res.json({

          error: response.error.message

        });

      }
      else{

        res.json({

          updatedOrder: response

        });

      }

    }
    else{

      res.json({

        error: 'response from back end is empty'

      });

    }

  }, (error) => {

    res.json({

      error: error.message

    });

  });

};
