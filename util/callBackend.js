const http = require('http');
const request = require('request');
const requestNamespace = require('../config/requestNamespace');

const {logger} = global;

const backendBasedUrl = process.env.BACKEND_URL || 'http://localhost:3001';

/**
 * Adds sensible default params before making call to backend API server
 * @param options
 */
function prepair(options) {
  if(!(options.req instanceof http.IncomingMessage)) {
    throw new Error(`invalid request object: ${options.req}. 'options.req' must be a expressJS request object`);
  }

  // add jwt as Cookie-header of api call request
  if(options.req.session.jwtToken) {
    if(options.headers) {
      options.headers.Cookie = `auth=${options.req.session.jwtToken}`;
    }
    else{
      options.headers = {Cookie: `auth=${options.req.session.jwtToken}`};
    }
  }

  if(options.req) {

    options.headers[ 'X-Request-Id' ] = requestNamespace.get('requestId');

  }

  // add backend host as baseUrl
  options.baseUrl = backendBasedUrl;

  /*
   For GET requests: parse response body to JSON object automatically, as backend API returns JSON most of the time
   For POST requests: stringify options.body object & parse response body to JSON object automatically, as backend API expects & returns JSON most of the time
   */
  options.json = true;

  // remove expressJS req from options before sending
  if(options.req) delete options.req;
}

function promisifyRequest(options) {

  return new Promise((resolve, reject) => {
    request(options, (error, response, body) => {

      if(error) {

        logger.debug(`callBackend.js: backend API call ${options.method ? options.method : 'GET'} ${options.baseUrl}${options.uri ? options.uri : options.url} has failed with reason= ${JSON.stringify(error)}`);

        reject(error);

      }
      else{

        logger.debug(`callBackend.js: backend API call ${options.method ? options.method : 'GET'} ${options.baseUrl}${options.uri ? options.uri : options.url} was successful, result=${JSON.stringify(body)}`);

        resolve(body);

      }

    });
  });
}

/**
 * Makes a GET request to backend API server.
 * Expects options object with following structure at least:
 * {
 *    uri: '/some/backend/api',
 *    req // expressJS request object
 * }
 *
 * For further options refer to https://github.com/request/request#requestoptions-callback
 *
 * @param {Object} options: options object as required by request module
 * @return {Promise<{Object}>} Promise of result object of the call if success, otherwise the error object
 */
module.exports.get = (options) => {
  prepair(options);

  logger.debug(`callBackend.js: UI calls backend API GET ${options.baseUrl}${options.uri ? options.uri : options.url} with options=${JSON.stringify(options)}`);

  return promisifyRequest(options, request);
};

/**
 * Makes a POST request to backend API server.
 * Expects options object with following structure at least:
 * {
 *    uri: '/some/backend/api',
 *    req // expressJS request object
 * }
 *
 * For further options refer to https://github.com/request/request#requestoptions-callback
 *
 * @param {Object} options: options object as required by request module
 * @return {Promise<{Object}>} Promise of result object of the call if success, otherwise the error object
 */
module.exports.post = (options) => {
  prepair(options);
  options.method = 'POST';

  logger.debug(`callBackend.js: UI calls backend API POST ${options.baseUrl}${options.uri ? options.uri : options.url} with options=${JSON.stringify(options)}`);

  return promisifyRequest(options, request);
};
