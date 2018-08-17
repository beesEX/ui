const { logger } = global;

/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
  logger.debug('Home page gets accessed');

  res.render('home', {
    title: 'Home'
  });
};
