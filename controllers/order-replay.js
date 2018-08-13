const {logger} = global;

const createRequestToBackend = require('../util/createRequestToBackend');

async function getFinanceStatus(req, currency) {
  return new Promise((resolve, reject) => {
    const reqToBackend = createRequestToBackend(req);
    reqToBackend.get(`/finance/status/${currency}`, (error, response, body) => {
      if(error) {
        reject(error);
      }
      else if(body) {
        const financeStatusObj = JSON.parse(body);

        if(financeStatusObj.errors && financeStatusObj.errors.length > 0) {
          reject(new Error(financeStatusObj.errors[ 0 ].message));
        }
        else{
          resolve(financeStatusObj);
        }
      }
      else{
        logger.error('finance status backend API sends no body back');

        reject(new Error('Unable to get finance status from backend'));
      }
    });
  });
}

exports.index = (req, res) => {
  res.render('order-replay', {title: 'Order-Replay'});
};

// GET /finance/status/:currency
exports.financeStatus = (req, res) => {
  logger.info(`order-replay.js financeStatus(): retrieves finance status of ${req.params.currency} ...`);

  getFinanceStatus(req, req.params.currency).then((financeStatus) => {
    logger.info(`order-replay.js financeStatus(): finance status: ${JSON.stringify(financeStatus, null, 2)}`);
    res.json(financeStatus);
  }, (error) => {
    res.json({error: error.message});
  });
};

async function depositFund(req, currency) {
  return new Promise((resolve, reject) => {
    const deposit = { currency, amount: req.body.amount };
    const options = {
      url: `/finance/deposit/${currency}`,
      form: deposit
    };

    const reqToBackend = createRequestToBackend(req);
    reqToBackend.get(options, (error, response, body) => {
      if(error) {
        reject(error);
      }
      else if(body) {
        const depositTX = JSON.parse(body);

        if(depositTX.errors && depositTX.errors.length > 0) {
          reject(new Error(depositTX.errors[ 0 ].message));
        }
        else{
          resolve(depositTX);
        }
      }
      else{
        logger.error('fund deposit backend API sends no body back');

        reject(new Error('Unable to get to call deposit fund on backend'));
      }
    });
  });
}

// POST /finance/deposit/:currency
exports.depositFund = (req, res) => {
  logger.info(`order-replay.js depositFund(): retrieves deposit fund request of ${req.body.amount} ${req.params.currency} ...`);

  depositFund(req, req.params.currency).then((depositTX) => {
    logger.info(`order-replay.js depositFund(): fund deposit successful tx = ${JSON.stringify(depositTX, null, 2)}`);
    res.json(depositTX);
  }, (error) => {
    res.json({error: error.message});
  });
};
