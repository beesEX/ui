/**
 * @author son87.lengoc@gmail.com
 * Created by Ngoc Son Le.
 */

const request = require('request');

const backendBasedUrl = process.env.BACKEND_URL || 'http://localhost:3001';

function wrapRequest(req) {

  if(!req.session) {

    throw new Error('can not find session in req object');

  }

  if(!req.session.jwtToken) {

    throw new Error('can not find jwt token in session of req object');

  }

  const defaultHeaders = {

    Cookie: `auth=${req.session.jwtToken}`

  };

  const defaultOptions = {

    baseUrl: backendBasedUrl,

    headers: defaultHeaders

  };

  return request.defaults(defaultOptions);

}

module.exports = wrapRequest;
