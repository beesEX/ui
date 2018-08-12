$(document).ready(() => {
  const currency = $('select#currency option:checked').val();
  $.get(`/finance/status/${currency}`, (financeStatus) => {
    console.log(JSON.stringify(financeStatus, null, 2));
  });
});
