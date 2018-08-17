/**
 * @author son87.lengoc@gmail.com
 * Created by Ngoc Son Le.
 */

const request = require('request');

const http = require('http');

const {logger} = global;

const backendBasedUrl = process.env.BACKEND_URL || 'http://localhost:3001';

function createRequest(req) {

  if(!(req instanceof http.IncomingMessage)) {

    throw new Error(`invalid request object: ${req}`);

  }

  if(!req.session) {

    throw new Error('can not find session in req object');

  }

  const defaultHeaders = {};

  if(!req.session.jwtToken) {

    logger.bindTo(req).warn('can not find jwt token in session of req object');


  }
  else{

    defaultHeaders.Cookie = `auth=${req.session.jwtToken}`;

  }

  const defaultOptions = {

    baseUrl: backendBasedUrl,

    headers: defaultHeaders

  };

  return request.defaults(defaultOptions);

}

module.exports = createRequest;
