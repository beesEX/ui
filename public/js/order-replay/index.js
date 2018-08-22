let websocket;
let selectedSide;
let orderList;
let csrfToken;
let server;

const GDAX = 'GDAX';
const GEMINI = 'GEMINI';

function toogleConnection() {
  const btn = document.getElementById('controlBtn');
  if(btn.innerHTML === 'connect') {
    connectWS();
    btn.innerHTML = 'disconnect';
  }
  else{
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

  websocket = new WebSocket(api);


  switch(api){

    case 'wss://ws-feed.gdax.com':

      server = GDAX;

      websocket.onopen = function(event) {

        const subscribeMessage = {

          type: 'subscribe',

          product_ids: ['BTC-USD'],

          channels: ['full']
        };

        websocket.send(JSON.stringify(subscribeMessage));
      };

      break;

    default:

      server = GEMINI;
  }

  websocket.onmessage = function(event) {
    const msg = JSON.parse(event.data);
    // console.log(JSON.stringify(msg, null, 2));
    processWSEvent(msg);
  };
}


function processWSEvent(msg) {

  switch(server){

    case GDAX:

      if(msg.type === 'received'){

        const event = {};

        event.side = msg.side === 'sell' ? 'ask' : 'bid';

        event.price = msg.price;

        event.delta = msg.size;

        processOrderPlacedEvent(event);

      }

      break;

    default: //GEMINI
      if(msg.type === 'update') {
        for(let i = 0; i < msg.events.length; i++) {
          const event = msg.events[i];
          if(event.type === 'change' & event.reason === 'place') {
            processOrderPlacedEvent(event);
          }
        }
      }
  }

}

function processOrderPlacedEvent(orderEvent) {
  if(orderEvent.side === selectedSide) {
    const li = document.createElement('li');
    li.appendChild(document.createTextNode(orderEvent.side + ' ' + orderEvent.price + ' ' + orderEvent.delta));
    orderList.insertBefore(li, orderList.firstChild);

    const xmlhttp = new XMLHttpRequest();
    xmlhttp.open('POST', '/order/place');
    xmlhttp.setRequestHeader('Content-Type', 'application/json');
    xmlhttp.setRequestHeader('x-csrf-token', csrfToken);
    xmlhttp.send(JSON.stringify({
      type: 'LIMIT',
      side: selectedSide === 'ask' ? 'SELL' : 'BUY',
      currency: 'BTC',
      baseCurrency: 'USDT',
      limitPrice: orderEvent.price,
      quantity: orderEvent.delta
    }));
  }
}

function closeWS() {
  websocket.close();
}

function loadFinanceStatus() {
  $('#amount').val('');

  const currency = $('select#currency option:checked').val();
  $.getJSON(`/finance/status/${currency}`, (financeStatus) => {
    console.log(JSON.stringify(financeStatus, null, 2));

    $('#balance').text(financeStatus.balance);
    $('#available').text(financeStatus.available);

    $('#txList').empty();

    const txLEList = [];
    txLEList.push('<tr><th>Nr.</th><th style="padding-right: 20px">Type</th><th>Amount</th><th>CreatedAt</th></tr>');
    $.each(financeStatus.txList, (index, tx) => {
      txLEList.push(`<tr><td>${index}</td><td style="padding-right: 20px">${tx.type}</td><td>${tx.amount}</td><td>${tx.createdAt}</td></tr>`);
    });
    $('<table/>', {
      html: txLEList.join('')
    }).appendTo('#txList');
  });
}

function depositFund() {
  const currency = $('select#currency option:checked').val();
  const amount = $('#amount').val();

  const xmlhttp = new XMLHttpRequest();
  xmlhttp.open('POST', `/finance/deposit/${currency}`, true);
  xmlhttp.setRequestHeader('Content-Type', 'application/json');
  xmlhttp.setRequestHeader('x-csrf-token', csrfToken);
  xmlhttp.onreadystatechange = function() {
    if(xmlhttp.readyState === 4 && xmlhttp.status === 200) {
      console.log(xmlhttp.responseText);
      loadFinanceStatus();
    }
  };
  xmlhttp.send(JSON.stringify({amount}));
}

$(document).ready(() => {
  csrfToken = $('#csrf').val();

  loadFinanceStatus();
});
