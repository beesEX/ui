const { createConsoleLogger } = require('@paralect/common-logger');

module.exports = createConsoleLogger({ isDev: process.env.NODE_ENV === 'development' });
