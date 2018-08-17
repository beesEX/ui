/**
 * @author son87.lengoc@gmail.com
 * Created by Ngoc Son Le.
 */

const {createNamespace} = require('continuation-local-storage');

const namespace = createNamespace('request');

module.exports = namespace;
