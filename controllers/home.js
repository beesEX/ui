const { logger } = global;

/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
  logger.bindTo(req).debug('Home page gets accessed');

  res.render('home', {
    title: 'Home'
  });
};
