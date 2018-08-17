const {createConsoleLogger} = require('@paralect/common-logger');

const logger = createConsoleLogger({isDev: process.env.NODE_ENV === 'development'});

function createWrappedConsoleLogger() {

  const wrappedLogger = {

    bindTo: function bindTo(request) {

      if(request && request.requestId) {

        wrappedLogger.requestId = request.requestId;

        request.res.on('finish', () => {

          wrappedLogger.requestId = '';

        });

      }

      return this;

    },

    log: function log(level, message) {

      if(arguments.length === 1) {

        message = level;

        level = logger.level || 'info';


      }

      wrappedLogger[ level ](message);

    }

  };

  let logLevels;

  if(logger && logger.levels) {

    logLevels = logger.levels;

  }
  else{

    logLevels = {

      debug: 4, error: 0, info: 2, silly: 5, verbose: 3, warn: 1

    };

  }

  const arrayOfLogLevel = Object.keys(logLevels);

  arrayOfLogLevel.forEach((logLevel) => {

    wrappedLogger[ logLevel ] = (message) => {

      if(wrappedLogger.requestId) {

        logger[ logLevel ](`[Request Id: ${wrappedLogger.requestId}]: ${message}`);

      }
      else{

        logger[ logLevel ](message);
      }

    };

  });

  return wrappedLogger;

}

module.exports = createWrappedConsoleLogger();
