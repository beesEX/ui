/**
 * @author son87.lengoc@gmail.com
 * Created by Ngoc Son Le.
 */

const {getOrdersFromBackEnd} = require('./order');

const createRequestToBackend = require('../util/createRequestToBackend');

const {logger} = global;

/**
 * Call GET /market/aggregatedOrderBook/:currency-:baseCurrency on Backend to get the current aggregated state of the
 * orderbook.
 *
 * @param req
 * @returns {Promise<any>}
 */
async function getAggregatedOrderBook(req) {

  logger.debug(`get aggregated order book  from back end with params: currency = ${req.params.currency} and base currency = ${req.params.baseCurrency}`);

  return new Promise((resolve, reject) => {

    const requestToBackend = createRequestToBackend(req);

    const url = process.env.BACKEND_MARKET_AGGREGATED_ORDER_BOOK
      .replace(':currency', req.params.currency)
      .replace(':baseCurrency', req.params.baseCurrency);

    requestToBackend.get(url, (error, response, body) => {

      if (error) {

        reject(error);

      }
      else if (body) {

        const parsedBody = JSON.parse(body);

        if (parsedBody.errors && parsedBody.errors.length > 0) {

          reject(new Error(parsedBody.errors[0].message));

        }
        else {

          resolve(parsedBody);

        }

      }
      else {

        logger.error('back end sends no body back');

        reject(new Error('Unable to get the aggregated order book'));
      }

    });
  });
}

exports.index = (req, res) => {

  logger.debug(`Market index page with symbol ${req.params.symbol} gets accessed`);

  const arrayOfCurrencies = req.params.symbol.split('_');

  [req.params.currency, req.params.baseCurrency] = arrayOfCurrencies;

  const limit = 10;

  const extraOptions = {

    limit,

    currency: req.params.currency,

    baseCurrency: req.params.baseCurrency

    // TODO status

  };

  const ordersPromise = getOrdersFromBackEnd(req, extraOptions);

  const aggregatedOrderBookPromise = getAggregatedOrderBook(req);

  Promise.all([ordersPromise, aggregatedOrderBookPromise]).then((arrayOfResponses) => {

    const data = arrayOfResponses[0];

    data.orders = JSON.stringify(arrayOfResponses[0].orders);
    data.limit = limit;
    data.title = 'Market';
    data.aggregatedState = JSON.stringify(arrayOfResponses[1]);

    res.render('market', data);


  }, (error) => {

    req.flash('errors', {msg: error.message});

    const data = {title: 'Market'};

    res.render('market', data);

  });

};
