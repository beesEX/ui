/**
 * @author son87.lengoc@gmail.com
 * Created by Ngoc Son Le.
 */

const uuidv4 = require('uuid/v4');

function generateUUIDForRequest(req, res, next) {

  req.requestId = uuidv4();

  next();

}

module.exports = generateUUIDForRequest;
