const rp = require('request-promise-native');
const http = require('http');

const {logger} = global;

const backendBasedUrl = process.env.BACKEND_URL || 'http://localhost:3001';

/**
 * Adds sensible default params before making call to backend API server
 * @param options
 */
function prepair(options) {
  if(!(options.req instanceof http.IncomingMessage)) {
    throw new Error(`invalid request object: ${options.req}. 'options.req' must be a expressKS request object`);
  }

  // add jwt as Cookie-header of api call request
  if (options.req.session.jwtToken) {
    if (options.headers) {
      options.headers.Cookie = `auth=${options.req.session.jwtToken}`;
    }
    else {
      options.headers = { Cookie: `auth=${options.req.session.jwtToken}`};
    }
  }

  // add backend host as baseUrl
  options.baseUrl = backendBasedUrl;

  /*
  For GET requests: parse response body to JSON object automatically, as backend API returns JSON most of the time
  For POST requests: stringify options.body object & parse response body to JSON object automatically, as backend API expects & returns JSON most of the time
   */
  options.json = true;

  // remove expressJS req from options before sending
  if (options.req) delete options.req;
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
 * @param options
 * @return result object of the call if success, otherwise the error object
 */
module.exports.get = (options) => {
  prepair(options);

  logger.info(`callBE.js: UI calls backend API GET ${options.baseUrl}${options.uri ? options.uri : options.url} with options=${JSON.stringify(options)}`);

  // just returns result of the call
  rp(options)
    .then((parsedBody) => {
      logger.info(`callBE.js: backend API GET ${options.baseUrl}${options.uri ? options.uri : options.url} successful, result=${JSON.stringify(parsedBody)}`);
      return parsedBody;
    })
    .catch((err) => { // simple default error handling
      logger.info(`callBE.js: backend API GET ${options.baseUrl}${options.uri ? options.uri : options.url} has failed with reason= ${JSON.stringify(err)}`);
      return err;
    });
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
 * @param options
 * @return result object of the call if success, otherwise the error object
 */
module.exports.post = (options) => {
  prepair(options);

  options.method = 'POST';

  logger.info(`callBE.js: UI calls backend API POST: ${options.baseUrl}${options.uri ? options.uri : options.url} with options=${JSON.stringify(options)}`);

  // just returns result of the call
  rp(options)
    .then((parsedBody) => {
      logger.info(`callBE.js: backend API POST ${options.baseUrl}${options.uri ? options.uri : options.url} successful, result=${JSON.stringify(parsedBody)}`);
      return parsedBody;
    })
    .catch((err) => { // simple default error handling
      logger.info(`callBE.js: backend API POST ${options.baseUrl}${options.uri ? options.uri : options.url} has failed with reason= ${JSON.stringify(err)}`);
      return err;
    });
};
