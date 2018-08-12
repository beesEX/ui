const { logger } = global;

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
  res.render('order-replay', { title: 'Order-Replay' });
};

// GET /finance/status/:currency
exports.financeStatus = (req, res) => {
  getFinanceStatus(req.params.currency)
    .then((financeStatus) => {
      res.json(financeStatus);
    }, (error) => {
      res.json(error);
    });
};
