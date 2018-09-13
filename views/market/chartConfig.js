/**
 * @author son87.lengoc@gmail.com
 * Created by Ngoc Son Le.
 */

const SYMBOL_DICTIONARY = {};

const CHART_SUPPORTED_RESOLUTIONS = ['1', '5', '15', '30', '60'];

SYMBOL_DICTIONARY['BTC_USDT'] = {

  name: 'BTC_USDT',

  ticker: 'BTC_USDT',

  description: 'BTC/USDT',

  type: 'crypto currency',

  session: '0900-1630', // TODO: trading session see https://github.com/beesEX/charting_library/wiki/Trading-Sessions

  exchange: 'BeesEx',

  listed_exchange: 'BeesEx',

  timezone: 'Europe/Berlin',

  minmov: 1,

  pricescale: 100,

  has_intraday: true,

  intraday_multipliers: CHART_SUPPORTED_RESOLUTIONS

};

exports.SYMBOL_DICTIONARY = SYMBOL_DICTIONARY;

exports.CHART_SUPPORTED_RESOLUTIONS = CHART_SUPPORTED_RESOLUTIONS;

