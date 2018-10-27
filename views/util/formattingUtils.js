function countDecimals(value) {
  if (Math.floor(value) !== value) {
    return value.toString().split('.')[1].length || 0;
  }

  return 0;
}

export default {
  formatAmount(num, currency) {
    if (currency === 'USDT') {
      return Math.round((num * 100) / 100).toFixed(2);
    }
    else if (currency === 'BTC' && countDecimals(num) > 6) {
      return num; // TODO cut the digits after 6. decimal digit
    }
    return num;
  },
};
