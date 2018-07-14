/**
 * @author son87.lengoc@gmail.com
 * Created by Ngoc Son Le.
 */

const { getOrdersFromBackEnd } = require('./order');

const { logger } = global;

exports.index = (req, res) => {

  logger.debug(`Market index page with symbol ${req.params.symbol} gets accessed`);

  const arrayOfCurrencies = req.params.symbol.split('_');

  [ req.params.currency, req.params.baseCurrency ] = arrayOfCurrencies;

  const limit = 10;

  const extraOptions = {

    limit,

    currency: req.params.currency,

    baseCurrency: req.params.baseCurrency

    // TODO status

  };

  const dataPromise = getOrdersFromBackEnd(req, extraOptions);

  dataPromise.then((data) => {

    data.orders = JSON.stringify(data.orders);

    data.limit = limit;

    res.render('market', data);

  }, (error) => {

    req.flash('errors', { msg: error.message });

    const data = {};

    res.render('market', data);

  });

};

