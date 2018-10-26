/**
 * @author son87.lengoc@gmail.com
 * Created by Ngoc Son Le.
 */

const zeroMQ = require('zeromq');
const requestNamespace = require('../config/requestNamespace');

const {logger} = global;

function subscribe(topic, callback) {

  const socket = zeroMQ.socket('sub');

  socket.connect(process.env.ZERO_MQ_URL);

  socket.subscribe(topic);

  logger.info(`subscribe to topic ${topic}`);

  const handleMessage = (topic, binaryMessage) => {

    const message = `${binaryMessage}`;
    requestNamespace.set('requestId', JSON.parse(message).requestId);

    logger.debug(`message of topic ${topic} from zeroMQ received: ${message}`);

    callback(message);

  };
  socket.on('message', requestNamespace.bind(handleMessage));

  return socket;
}

module.exports = subscribe;

