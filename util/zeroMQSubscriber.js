/**
 * @author son87.lengoc@gmail.com
 * Created by Ngoc Son Le.
 */

const zeroMQ = require('zeromq');

const {logger} = global;

function subscribe(topic, callback) {

  const socket = zeroMQ.socket('sub');

  socket.connect(process.env.ZERO_MQ_URL);

  socket.subscribe(topic);

  logger.info(`subscribe to topic ${topic}`);

  socket.on('message', (topic, binaryMessage) => {

    const message = `${binaryMessage}`;

    logger.debug(`message of topic ${topic} from zeroMQ received: ${message}`);

    callback(message);

  });

  return socket;
}

module.exports = subscribe;

