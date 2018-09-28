/**
 * @author son87.lengoc@gmail.com
 * Created by Ngoc Son Le.
 */

import uuidv4 from 'uuid/v4';

function initEvent(eventName, websocket, mapOfHandlers, action) {

  websocket[eventName] = (event) => {

    if(action) {

      action();

    }

    const arrayOfHandlerIds = Object.keys(mapOfHandlers);

    arrayOfHandlerIds.forEach((id) => {

      const handler = mapOfHandlers[id];

      handler(event);

    });

  };

}

export default class WebSocketToServer {

  constructor(url) {

    this.websocket = new WebSocket(url);

    this.mapOfIdAndOnMessageHandler = {};

    this.mapOfIdAndOnOpenHandler = {};

    this.mapOfIdAndOnErrorHandler = {};

    this.mapOfIdAndOnCloseHandler = {};

    initEvent('onmessage', this.websocket, this.mapOfIdAndOnMessageHandler);

    initEvent('onopen', this.websocket, this.mapOfIdAndOnOpenHandler, () => {

      this.isOpen = true;

      if(this.openResolver) {

        this.openResolver();

      }


    });

    initEvent('onclose', this.websocket, this.mapOfIdAndOnCloseHandler);

    initEvent('onerror', this.websocket, this.mapOfIdAndOnErrorHandler);

  }

  send(message) {

    this.open().then(() => {

      this.websocket.send(message);

    }, (error) => {

      throw error;

    });

  }

  async open() {

    return new Promise((resolve, reject) => {

      if(this.isOpen) {

        resolve();

      }
      else{

        this.openResolver = resolve;

        setTimeout(() => {

          reject(new Error('can not open a web socket channel to server'));

          this.openResolver = undefined;


        }, 1000);

      }

    });
  }

  onMessage(handler) {

    if(handler) {

      const id = uuidv4();

      this.mapOfIdAndOnMessageHandler[id] = handler;

      return id;

    }

  }

  offMessage(id) {

    if(id) {

      delete this.mapOfIdAndOnMessageHandler[id];

    }

  }

  onError(handler) {

    if(handler) {

      const id = uuidv4();

      this.mapOfIdAndOnErrorHandler[id] = handler;

      return id;

    }

  }

  offError(id) {

    if(id) {

      delete this.mapOfIdAndOnErrorHandler[id];

    }

  }

  onClose(handler) {

    if(handler) {

      const id = uuidv4();

      this.mapOfIdAndOnCloseHandler[id] = handler;

      return id;

    }

  }

  offClose(id) {

    if(id) {

      delete this.mapOfIdAndOnCloseHandler[id];

    }

  }

  onOpen(handler) {

    if(handler) {

      const id = uuidv4();

      this.mapOfIdAndOnOpenHandler[id] = handler;

      return id;

    }

  }

  offOpen(id) {

    if(id) {

      delete this.mapOfIdAndOnOpenHandler[id];

    }

  }


}
