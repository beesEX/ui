/**
 * @author son87.lengoc@gmail.com
 * Created by Ngoc Son Le.
 */

const {getOrdersFromBackEnd} = require('./order');

const requestToBackEnd = require('../util/callBackend');

const {logger} = global;

/**
 * Call GET /market/aggregatedOrderBook/:currency-:baseCurrency on Backend to get the current aggregated state of the
 * orderbook.
 *
 * @param req
 * @returns {Promise<any>}
 */
async function getAggregatedOrderBook(req) {

  logger.bindTo(req).debug(`get aggregated order book  from back end with params: currency = ${req.params.currency} and base currency = ${req.params.baseCurrency}`);

  if(process.env.BACKEND_MARKET_AGGREGATED_ORDER_BOOK) {

    const url = process.env.BACKEND_MARKET_AGGREGATED_ORDER_BOOK.replace(':currency', req.params.currency).replace(':baseCurrency', req.params.baseCurrency);

    const options = {

      url,

      req

    };

    return requestToBackEnd.get(options);

  }

  return Promise.reject(new Error('Url for getting aggragated state of order book on back end do not exist in process.env'));

}

exports.index = (req, res) => {

  logger.bindTo(req).debug(`Market index page with symbol ${req.params.symbol} gets accessed`);

  const arrayOfCurrencies = req.params.symbol.split('_');

  [ req.params.currency, req.params.baseCurrency ] = arrayOfCurrencies;

  const limit = 10;

  const extraOptions = {

    limit,

    currency: req.params.currency,

    baseCurrency: req.params.baseCurrency

    // TODO status

  };

  const ordersPromise = getOrdersFromBackEnd(req, extraOptions);

  const aggregatedOrderBookPromise = getAggregatedOrderBook(req);

  Promise.all([ ordersPromise, aggregatedOrderBookPromise ]).then((arrayOfResponses) => {

    const dataFromOrdersPromise = arrayOfResponses[ 0 ];

    const dataFromAggregatedOrderBookPromise = arrayOfResponses[ 1 ];

    let errorOccurred = false;

    if(dataFromOrdersPromise instanceof Error) {

      req.flash('errors', {msg: dataFromOrdersPromise.message});

      errorOccurred = true;

    }
    else if(dataFromOrdersPromise.error) {

      req.flash('errors', {msg: dataFromOrdersPromise.error.message});

      errorOccurred = true;

    }

    if(typeof dataFromAggregatedOrderBookPromise === 'string') {

      req.flash('errors', {msg: dataFromAggregatedOrderBookPromise});

      errorOccurred = true;

    }
    else if(dataFromAggregatedOrderBookPromise.error) {

      req.flash('errors', {msg: dataFromAggregatedOrderBookPromise.error.message});

      errorOccurred = true;

    }
    else if(dataFromAggregatedOrderBookPromise instanceof Error) {

      req.flash('errors', {msg: dataFromAggregatedOrderBookPromise.message});

      errorOccurred = true;

    }


    if(errorOccurred) {

      const data = {title: 'Market'};

      res.render('market', data);
    }
    else{

      const data = dataFromOrdersPromise;

      data.limit = limit;

      data.currency = extraOptions.currency;

      data.baseCurrency = extraOptions.baseCurrency;

      data.title = 'Market';

      data.aggregatedState = dataFromAggregatedOrderBookPromise;

      res.render('market', data);

    }


  }, (error) => {

    req.flash('errors', {msg: error.message});

    const data = {title: 'Market'};

    res.render('market', data);

  });

};
