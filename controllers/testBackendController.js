/**
 * @author son87.lengoc@gmail.com
 * Created by Ngoc Son Le.
 */

const makeRequest = require('request');
const { logger } = global;

exports.index = (req, res) => {

  let backendTestHelloWorldUrl = process.env.BACKEND_URL || 'http://localhost:3001';
  backendTestHelloWorldUrl += process.env.BACKEND_TEST_CONNECT_URL || '/test/helloWorld';

  var options = {
    url: backendTestHelloWorldUrl,
    headers: {
      Cookie: 'auth=' + req.session.jwtToken
    }
  };

  logger.info(`UI making request to secured backend API: ${JSON.stringify(options)}`);

  makeRequest(options, (err, httpResponse, body) => {
    //no need to handle error yet
    let bodyAsJSON = JSON.parse(body);

    if (bodyAsJSON.errors) {
      let arrayOfErrors;

      if (Array.isArray(bodyAsJSON.errors)) {
        arrayOfErrors = bodyAsJSON.errors;
      }
      else {
        arrayOfErrors = [new Error(bodyAsJSON.errors.toString())];
      }

      for (let error of arrayOfErrors) {
        req.flash('errors', { msg: error.message });
      }
    }

    res.render('helloWorldBackEnd', {
      message: bodyAsJSON.message
    });
  });
};
