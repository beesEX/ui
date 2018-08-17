const {logger} = global;

const { get, post } = require('../util/callBackend');

exports.index = (req, res) => {
  res.render('order-replay', {title: 'Order-Replay'});
};

// GET /finance/status/:currency
exports.financeStatus = async (req, res) => {
  logger.info(`order-replay.js financeStatus(): retrieves finance status of ${req.params.currency} ...`);

  const options = {
    uri: `/finance/status/${req.params.currency}`,
    req
  };
  const financeStatus = await get(options);

  res.json(financeStatus);
};

// POST /finance/deposit/:currency
exports.depositFund = async (req, res) => {
  logger.info(`order-replay.js depositFund(): deposit fund request of ${req.body.amount} ${req.params.currency} ...`);

  const options = {
    uri: `/finance/deposit/${req.params.currency}`,
    body: {
      amount: req.body.amount,
      currency: req.params.currency
    },
    req
  };
  const depositTX = await post(options);

  res.json(depositTX);
};
