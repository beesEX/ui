/**
 * @author son87.lengoc@gmail.com
 * Created by Ngoc Son Le.
 */

const WebSocket = require('ws');

const http = require('http');

const {logger} = global;

function WebSocketServer(port) {

  const server = http.createServer();

  const setOfOpenWebSockets = new Set();

  const instance = new WebSocket.Server({

    server,

    perMessageDeflate: {

      zlibDeflateOptions: { // See zlib defaults.

        chunkSize: 1024,

        memLevel: 7,

        level: 3,

      },

      zlibInflateOptions: {

        chunkSize: 10 * 1024

      },

      // Other options settable:

      // Defaults to negotiated value.
      clientNoContextTakeover: true,

      // Defaults to negotiated value.
      serverNoContextTakeover: true,

      // Defaults to negotiated value.
      clientMaxWindowBits: 10,

      // Defaults to negotiated value.
      serverMaxWindowBits: 10,

      // Below options specified as default values.

      // Limits zlib concurrency for perf.
      concurrencyLimit: 10,

      // Size (in bytes) below which messages should not be compressed.
      threshold: 1024
    }

  });

  // init default event handler and emit custom events if needed
  instance.on('connection', (webSocket, request) => {

    logger.debug(`new connection: request = ${request}`);

    setOfOpenWebSockets.add(webSocket);

    webSocket.requestedPath = request.url;

    webSocket.on('close', () => {

      setOfOpenWebSockets.delete(webSocket);

    });

    // emit custom events if needed

  });

  const destroyAllOpenSockets = () => {

    setOfOpenWebSockets.forEach((webSocket) => {

      webSocket._socket.destroy();

    });

  };

  const hasRequestedPath = (client, path) => {

    if(!path) {

      return true;

    }

    if(client.requestedPath === path) {

      return true;

    }

    return false;

  };


  this.start = async () => new Promise((resolve, reject) => {

    server.listen(port, (error) => {

      if(error) {

        reject(error);

      }
      else{

        logger.info(`web socket server has started at port ${port}`);

        resolve();

      }

    });

  });


  this.stop = async () => new Promise((resolve, reject) => {

    destroyAllOpenSockets();

    server.close((error) => {

      if(error) {

        reject(error);

      }
      else{

        logger.info('web socket server has stopped');

        resolve();
      }

    });

  });


  /**
   * Server broadcasts a `message` to all clients with specific `requestedPath`
   * If `requestedPath` is null,  all clients will receive the `message`
   *
   * @param message
   * @param requestedPath
   */
  this.broadcast = (message, requestedPath) => {

    instance.clients.forEach((client) => {

      if(hasRequestedPath(client, requestedPath)) {

        if(client.readyState === WebSocket.OPEN) {

          client.send(message);

        }

      }

    });

  };

}

module.exports = WebSocketServer;
