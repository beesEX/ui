/**
 * @author son87.lengoc@gmail.com
 * Created by Ngoc Son Le.
 */

const uuidv4 = require('uuid/v4');

const requestNamespace = require('../../config/requestNamespace');

function generateUUIDForRequest(req, res, next) {

  requestNamespace.set('requestId', uuidv4());

  next();

}

module.exports = requestNamespace.bind(generateUUIDForRequest);
