let geminiWS;
let selectedSide;
let orderList;
let csrfToken;

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

  const apiSelect = document.getElementById('api');
  const api = apiSelect.options[apiSelect.selectedIndex].value;

  orderList = document.getElementById('orderList');

  geminiWS = new WebSocket(api);

  geminiWS.onmessage = function (event) {
    const msg = JSON.parse(event.data);
    // console.log(JSON.stringify(msg, null, 2));
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
    li.appendChild(document.createTextNode(orderEvent.side + ' ' + orderEvent.price + ' ' + orderEvent.delta));
    orderList.insertBefore(li, orderList.firstChild);

    const xmlhttp = new XMLHttpRequest();
    xmlhttp.open('POST', '/order/place');
    xmlhttp.setRequestHeader('Content-Type', 'application/json');
    xmlhttp.setRequestHeader('x-csrf-token', csrfToken);
    xmlhttp.send(JSON.stringify({ type: 'LIMIT', side: selectedSide === 'ask' ? 'SELL':'BUY', currency: 'BTC', baseCurrency: 'USDT', limitPrice: orderEvent.price, quantity: orderEvent.delta }));
  }
}

function closeWS() {
  geminiWS.close();
}

function loadFinanceStatus() {
  const currency = $('select#currency option:checked').val();
  $.getJSON(`/finance/status/${currency}`, (financeStatus) => {
    console.log(JSON.stringify(financeStatus, null, 2));

    $('#balance').text(financeStatus.balance);
    $('#available').text(financeStatus.available);

    $('#txList').empty();

    const txLEList = [];
    $.each(financeStatus.txList, (tx) => {
      txLEList.push(`<li>${JSON.stringify(tx)}</li>`);
    });
    $('<ul/>', {
      html: txLEList.join('')
    }).appendTo('#txList');
  });
}

function depositFund() {
  const currency = $('select#currency option:checked').val();
  const amount = $('#amount').val();

  const xmlhttp = new XMLHttpRequest();
  xmlhttp.open('POST', `/finance/deposit/${currency}`);
  xmlhttp.setRequestHeader('Content-Type', 'application/json');
  xmlhttp.setRequestHeader('x-csrf-token', csrfToken);
  xmlhttp.send(JSON.stringify({ amount }));
}

$(document).ready(() => {
  csrfToken = $('#csrf').val();

  loadFinanceStatus();
});
