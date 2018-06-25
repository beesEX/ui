/**
 * @author son87.lengoc@gmail.com
 * Created by Ngoc Son Le.
 */

const wrapRequest = require('../util/requestToBackEnd');

const { logger } = global;

exports.index = (req, res) => {

  const requestToBackend = wrapRequest(req);

  logger.info('UI making request to secured backend API');

  requestToBackend(process.env.BACKEND_TEST_CONNECT_URL, (err, httpResponse, body) => {

    // no need to handle error yet
    const bodyAsJSON = JSON.parse(body);

    if(bodyAsJSON.errors) {

      let arrayOfErrors;

      if(Array.isArray(bodyAsJSON.errors)) {

        arrayOfErrors = bodyAsJSON.errors;

      }
      else{

        arrayOfErrors = [ new Error(bodyAsJSON.errors.toString()) ];

      }

      let error;

      for(let i = 0; i < arrayOfErrors.length; i++) {

        error = arrayOfErrors[ i ];

        req.flash('errors', { msg: error.message });

      }
    }

    res.render('helloWorldBackEnd', {

      message: bodyAsJSON.message

    });

  });
};
