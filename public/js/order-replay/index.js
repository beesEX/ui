let geminiWS;
let selectedSide;
let orderList;

function toogleConnection() {
  const btn = document.getElementById('controlBtn');
  if (btn.innerHTML === 'connect') {
    connectWS();
    btn.innerHTML = 'disconnect';
  } else {
    closeWS();
    btn.innerHTML = 'connect';
  }
}

function connectWS() {
  const sideSelectEle = document.getElementById('side');
  selectedSide = sideSelectEle.options[sideSelectEle.selectedIndex].value;

  orderList = document.getElementById('orderList');

  geminiWS = new WebSocket('wss://api.gemini.com/v1/marketdata/btcusd');
  console.log(`readyState=${geminiWS.readyState}`);

  geminiWS.onmessage = function (event) {
    const msg = JSON.parse(event.data);
    console.log(JSON.stringify(msg, null, 2));
    processWSEvent(msg);
  };
}


function processWSEvent(msg) {
  if (msg.type === 'update') {
    for (let i = 0; i < msg.events.length; i++) {
      const event = msg.events[i];
      if (event.type === 'change' & event.reason === 'place') {
        processOrderPlacedEvent(event);
      }
    }
  }
}

function processOrderPlacedEvent(orderEvent) {
  if (orderEvent.side === selectedSide) {
    const li = document.createElement('li');
    li.appendChild(document.createTextNode(`${orderEvent.side} ${orderEvent.price} ${orderEvent.delta}`));
    orderList.insertBefore(li, orderList.firstChild);
  }
}

function closeWS() {
  geminiWS.close();
}
