const {logger} = global;

const { get, post } = require('../util/callBackend');

exports.index = (req, res) => {
  res.render('order-replay', {title: 'Order-Replay'});
};

// GET /finance/status/:currency
exports.financeStatus = (req, res) => {
  logger.info(`order-replay.js financeStatus(): retrieves finance status of ${req.params.currency} ...`);

  const options = {
    uri: `/finance/status/${req.params.currency}`,
    req
  };
  get(options).then((financeStatus) => {
    res.json(financeStatus);
  }).catch((err) => {
    res.json(err);
    res.status(500);
  });
};

// POST /finance/deposit/:currency
exports.depositFund = (req, res) => {
  logger.info(`order-replay.js depositFund(): deposit fund request of ${req.body.amount} ${req.params.currency} ...`);

  const options = {
    uri: `/finance/deposit/${req.params.currency}`,
    body: {
      amount: req.body.amount,
      currency: req.params.currency
    },
    req
  };
  post(options).then((depositTX) => {
    res.json(depositTX);
  }).catch((err) => {
    res.json(err);
    res.status(500);
  });
};
