/**
 * @author son87.lengoc@gmail.com
 * Created by Ngoc Son Le.
 */

const wrapRequest = require('../util/createRequestToBackend');

const { logger } = global;

exports.index = (req, res) => {

  logger.info('UI making request to secured backend API');

  res.render('order-replay');
};
