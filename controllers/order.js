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
