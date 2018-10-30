const orderList = document.getElementById('orderList');
let csrfToken;
let id;
const resetResultList = document.getElementById('resetResult');

function postAjax(url, data, callback) {
  const xmlhttp = new XMLHttpRequest();
  xmlhttp.open('POST', url, true);
  xmlhttp.setRequestHeader('Content-Type', 'application/json');
  xmlhttp.setRequestHeader('x-csrf-token', csrfToken);
  xmlhttp.onreadystatechange = function() {
    if(xmlhttp.readyState === 4 && xmlhttp.status === 200) {
      console.log(xmlhttp.responseText);
      callback(xmlhttp.responseText);
    }
  };

  if(data) {

    xmlhttp.send(JSON.stringify(data));

  }
  else{

    xmlhttp.send();

  }

}

function stop() {

  const data = {

    action: 'stop',

    id

  };

  postAjax(' /order-replay', data, (responseText) => {

    const li = document.createElement('li');

    li.appendChild(document.createTextNode('order replay has been stopped'));

    orderList.insertBefore(li, orderList.firstChild);

  });

}

function start() {
  const apiSelect = document.getElementById('api');
  const api = apiSelect.options[apiSelect.selectedIndex].value;

  const sideSelectEle = document.getElementById('side');
  const side = sideSelectEle.options[sideSelectEle.selectedIndex].value;

  const data = {

    source: api,

    action: 'start',

    side

  };

  postAjax(' /order-replay', data, (responseText) => {

    const response = JSON.parse(responseText);

    let text;

    if(response.error) {

      text = 'can not start the order replay process. An error has been occurred';

    }
    else{

      id = response.data.id;

      text = response.data.message;

    }

    const li = document.createElement('li');

    li.appendChild(document.createTextNode(text));

    orderList.insertBefore(li, orderList.firstChild);

  });

}

function toogleConnection() {
  const btn = document.getElementById('controlBtn');
  if(btn.innerHTML === 'start') {
    start();
    btn.innerHTML = 'stop';
  }
  else{
    stop();
    btn.innerHTML = 'start';
  }
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
    txLEList.push(`<tr><th>Nr.</th><th style='padding-right: 20px'>Type</th><th>Amount${''}</th><th>CreatedAt</th></tr>`);
    $.each(financeStatus.txList, (index, tx) => {
      txLEList.push(`<tr><td>${index}</td><td style='padding-right: 20px'>${tx.type}</td><td>${tx.amount}</td><td>${tx.createdAt}</td></tr>`);
    });
    $('<table/>', {
      html: txLEList.join('')
    }).appendTo('#txList');
  });
}

function depositFund() {
  const currency = $('select#currency option:checked').val();
  const amount = $('#amount').val();
  postAjax(`/finance/deposit/${currency}`, {amount}, loadFinanceStatus);
}

$(document).ready(() => {
  csrfToken = $('#csrf').val();
  loadFinanceStatus();
});


function reset() {

  postAjax('/order-replay/reset', null, (responseText) => {

    let text = 'DONE';

    if(responseText && responseText !== 'OK') {

      const response = JSON.parse(responseText);

      if(response.error) {

        text = response.error.msg || response.error.message;

      }
    }

    const li = document.createElement('li');

    li.appendChild(document.createTextNode(text));

    resetResultList.insertBefore(li, resetResultList.firstChild);

  });
}
