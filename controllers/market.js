/**
 * @author son87.lengoc@gmail.com
 * Created by Ngoc Son Le.
 */

const {getOrdersFromBackEnd} = require('./order');

const requestToBackEnd = require('../util/callBackend');

const {logger} = global;

const {ROUTE_TO_MARKET_INDEX} = require('../config/routeDictionary');

const {getErrorFromResponse} = require('../util/backendResponseUtil');

/**
 * Call GET /market/aggregatedOrderBook/:currency-:baseCurrency on Backend to get the current aggregated state of the
 * orderbook.
 *
 * @param req
 * @returns {Promise<any>}
 */
async function getAggregatedOrderBook(req) {

  logger.debug(`get aggregated order book  from back end with params: currency = ${req.params.currency} and base currency = ${req.params.baseCurrency}`);

  if(process.env.BACKEND_MARKET_AGGREGATED_ORDER_BOOK) {

    const url = process.env.BACKEND_MARKET_AGGREGATED_ORDER_BOOK.replace(':currency', req.params.currency)
      .replace(':baseCurrency', req.params.baseCurrency);

    const options = {

      url,

      req

    };

    return requestToBackEnd.get(options);

  }

  return Promise.reject(new Error('Url for getting aggregated state of order book on the back end server does not exist in process.env'));

}

async function getAvailableBalance(req, currency) {

  logger.debug(`get balance from back end with params: currency = ${currency}`);

  if(process.env.BACKEND_USER_AVAILABLE_BALANCE) {

    const url = process.env.BACKEND_USER_AVAILABLE_BALANCE.replace(':currency', currency);

    const options = {

      url,

      req

    };

    return requestToBackEnd.get(options);

  }

  return Promise.reject(new Error('Url for getting balance from the back end server does not exist in process.env'));

}

async function getLastTrades(req) {
  const options = {
    url: process.env.BACKEND_MARKET_TRADES.replace(':currency', req.params.currency).replace(':baseCurrency', req.params.baseCurrency),
    req
  };

  return requestToBackEnd.get(options);
}

exports.index = (req, res) => {

  logger.debug(`Market index page with symbol ${req.params.symbol} gets accessed`);

  const arrayOfCurrencies = req.params.symbol.split('_');

  [req.params.currency,
    req.params.baseCurrency] = arrayOfCurrencies;

  const limit = 10;

  const extraOptions = {

    limit,

    currency: req.params.currency,

    baseCurrency: req.params.baseCurrency

    // TODO status

  };

  const ordersPromise = getOrdersFromBackEnd(req, extraOptions);

  const aggregatedOrderBookPromise = getAggregatedOrderBook(req);

  const currencyAvailableBalancePromise = getAvailableBalance(req, req.params.currency);

  const basecurrencyAvailableBalancePromise = getAvailableBalance(req, req.params.baseCurrency);

  const lastTradesPromise = getLastTrades(req);

  Promise.all([ordersPromise,
    aggregatedOrderBookPromise,
    currencyAvailableBalancePromise,
    basecurrencyAvailableBalancePromise,
    lastTradesPromise])
    .then((arrayOfResponses) => {

      let errorOccurred = false;

      arrayOfResponses.forEach((data) => {

        const errorObject = getErrorFromResponse(data, 'string');

        if(errorObject) {

          errorOccurred = true;

          req.flash('errors', errorObject);

        }
      });

      if(errorOccurred) {

        const data = {title: 'Market'};

        res.render('market', data);
      }
      else{

        const dataFromOrdersPromise = arrayOfResponses[0];

        const dataFromAggregatedOrderBookPromise = arrayOfResponses[1];

        const dataFromCurrencyAvailableBalancePromise = arrayOfResponses[2];

        const dataFrombaseCurrencyAvailableBalancePromise = arrayOfResponses[3];

        const lastTrades = arrayOfResponses[4].data;

        const data = dataFromOrdersPromise;

        data.limit = limit;

        data.currency = extraOptions.currency;

        data.baseCurrency = extraOptions.baseCurrency;

        data.title = 'Market';

        data.aggregatedOrderBookState = dataFromAggregatedOrderBookPromise;

        data.currencyAvailableBalance = dataFromCurrencyAvailableBalancePromise;

        data.baseCurrencyAvailableBalance = dataFrombaseCurrencyAvailableBalancePromise;

        data.lastTrades = lastTrades;

        res.render('market', data);

      }


    }, (error) => {

      req.flash('errors', {msg: error.message});

      const data = {title: 'Market'};

      res.render('market', data);

    });

};


const supportedCurrencies = require('../util/SupportedCurrencies');

const subscribe = require('../util/zeroMQSubscriber');

const arrayOfSockets = [];

const prefix = 'Orderbook';


exports.handleOrderBookStateChangeEvent = (websocket) => {

  const arrayOfSymbols = [];

  for(let i = 0; i < supportedCurrencies.length; i++) {

    const firstCurrency = supportedCurrencies[i];

    for(let j = i + 1; j < supportedCurrencies.length; j++) {

      const secondCurrency = supportedCurrencies[j];

      arrayOfSymbols[0] = `${firstCurrency}_${secondCurrency}`;

      arrayOfSymbols[1] = `${secondCurrency}_${firstCurrency}`;

      arrayOfSymbols.forEach((symbol) => {

        const requestedPath = ROUTE_TO_MARKET_INDEX.replace(':symbol', symbol);

        const topic = `${prefix}-${symbol}`;

        const socket = subscribe(topic, (message) => {

          websocket.broadcast(message, requestedPath);

        });

        arrayOfSockets.push(socket);

      });

    }

  }
};

exports.getOHLCVDataPoints = (req, res) => {

  logger.debug(`get ohlcv: params = ${JSON.stringify(req.params)}: query = ${req.query && JSON.stringify(req.query)}`);

  let url = process.env.BACKEND_MARKET_OHCLV_DATA_POINTS
    .replace(':currency', req.params.currency)
    .replace(':baseCurrency', req.params.baseCurrency)
    .replace(':resolution', req.params.resolution);

  const from = (req.query.from !== undefined) ? req.query.from : '';

  const to = (req.query.to !== undefined) ? req.query.to : '';

  url += `?from=${from}&to=${to}`;

  const options = {

    url,

    req

  };


  const resultFromBackEndPromise = requestToBackEnd.get(options);

  resultFromBackEndPromise.then((resultFromBackEnd) => {

    res.json(resultFromBackEnd);

  });

};

