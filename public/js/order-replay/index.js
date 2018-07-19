let geminiWS;

function processWSEvent(msg) {
  if (msg.type === 'update') {
    for (let i = 0; i < msg.events.length; i++) {
      const event = msg.events[i];
      if (event.type === 'change') {
      }
    }
  }
}

function connectWS() {
  geminiWS = new WebSocket('wss://api.gemini.com/v1/marketdata/btcusd');
  console.log(`readyState=${geminiWS.readyState}`);

  geminiWS.onmessage = function (event) {
    const msg = JSON.parse(event.data);
    console.log(JSON.stringify(msg, null, 2));
    processWSEvent(msg);
  };
}

function closeWS() {
  geminiWS.close();
}
