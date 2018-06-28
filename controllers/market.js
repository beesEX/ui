/**
 * @author son87.lengoc@gmail.com
 * Created by Ngoc Son Le.
 */

const { logger } = global;

exports.index = (req, res) => {

  logger.debug(`Market index page with id ${req.params.id} gets accessed`);

  const arrayOfCurrencies = req.params.symbol.split('_');

  const currency = arrayOfCurrencies[ 0 ];

  const baseCurrency = arrayOfCurrencies[ 1 ];

  res.render('market', {

    heading: req.params.symbol.replace('_', '/'),

    currency,

    baseCurrency

  });

};
