/**
 * @author son87.lengoc@gmail.com
 * Created by Ngoc Son Le.
 */

import ajax from '../util/ajax';

const {ROUTE_TO_MARKET_OHLCV} = require('../../config/routeDictionary');

const {CHART_SUPPORTED_RESOLUTIONS, SYMBOL_DICTIONARY} = require('./chartConfig');

/**
 * This class implements the js data feed interface of the trading view chart
 */
export default class BeesExDataFeed {

  /**
   * This call is intended to provide the object filled with the configuration data.
   * This data partially affects the chart behavior and is called server-side customization.
   * Charting Library assumes that you will call the callback function and pass your datafeed 'configurationData' as an
   * argument
   * @callback callback
   * @param {Object} configurationData
   *
   * @param {Object[]} configurationData.exchanges - An array of exchange descriptors. exchanges = [] leads to the
   *   absence of the exchanges filter in Symbol Search list
   * @param {Object} configurationData.exchanges[].name
   * @param {Object} configurationData.exchanges[].value - value will be passed as exchange argument to
   *   {@link BeesExDataFeed#searchSymbols}. Use value = "" if you wish to include all exchanges.
   * @param {Object} configurationData.exchanges[].desc
   *
   *
   * @param {Object[]} configurationData.symbols_types - An array of filter descriptors. symbolsTypes = [] leads to the
   *   absence of filter types in Symbol Search list.
   * @param {Object} configurationData.symbols_types[].name
   * @param {Object} configurationData.symbols_types[].value - value will be passed as symbolType argument to
   *   {@link BeesExDataFeed#searchSymbols}. Use value = "" if you wish to include all filter types
   *
   * @param {string[]} configurationData.supported_resolutions - An array of supported resolutions. Resolution must be
   *   a string. E.g.
   * @example ["1", "15", "240", "D", "6M"] will give you "1 minute, 15 minutes, 4 hours, 1 day, 6 months" in
   *   resolution widget. Format is described in
   *   {@link https://github.com/beesEX/charting_library/wiki/Resolution | the article}.
   *
   * @param {Boolean} configurationData.supports_marks - Boolean showing whether your datafeed supports marks on bars
   *   or not.
   *
   * @param {Boolean} configurationData.supports_timescale_marks - Boolean showing whether your datafeed supports
   *   timescale marks or not.
   *
   * @param {Boolean} configurationData.supports_time - Set this one to true if your datafeed provides server time
   *   (unix time). It is used to adjust Countdown on the Price scale.
   *
   *@param {RegExp} configurationData.futures_regex - Set it if you want to group futures in the symbol search. This
   *   REGEX should divide an instrument name into 2 parts: a root and an expiration.
   * @example <caption>It will be applied to the instruments with futures as a type.</caption>
   * /^(.+)([12]!|[FGHJKMNQUVXZ]\d{1,2})$/.
   *
   */
  onReady(callback) {

    const configurationData = {};

    configurationData.exchanges = [];

    configurationData.symbols_types = [];

    configurationData.supports_search = false;

    configurationData.supported_resolutions = CHART_SUPPORTED_RESOLUTIONS;

    configurationData.supports_marks = false;

    configurationData.supports_timescale_marks = false;

    configurationData.supports_time = false;

    callback(configurationData);

  }

  /**
   *
   * @param {string} userInput - It is text entered by user in the symbol search field.
   * @param {string} exchange - The requested exchange (chosen by user). Empty value means no filter was specified.
   * @param {string} symbolType - The requested symbol type: index, stock, forex, etc (chosen by user).
   *
   * @callback onResultReadyCallback
   * @param {Object[]} result
   * @example <caption>result: array of objects</caption>
   * [
   *    {
   *        "symbol": "<short symbol name>",
   *        "full_name": "<full symbol name>", // e.g. BTCE:BTCUSD
   *        "description": "<symbol description>",
   *        "exchange": "<symbol exchange name>",
   *        "ticker": "<symbol ticker name, optional>",
   *       "type": "stock" // or "futures" or "bitcoin" or "forex" or "index"
   *    },
   *    {
   *        //    .....
   *    }
   *]
   */
  searchSymbols(userInput, exchange, symbolType, onResultReadyCallback) {

    // not support search symbol yet
    onResultReadyCallback([]);

  }

  /**
   * Charting Library will call this function when it needs to get SymbolInfo by symbol name
   * @param {string} symbolName - Symbol name or ticker if provided.
   *
   * @callback onSymbolResolvedCallback
   * @param {SymbolInfo} symbolInfo - {@link
    *   https://github.com/beesEX/charting_library/wiki/Symbology#symbolinfo-structure | SymbolInfo}
   *
   * @callback onResolveErrorCallback
   * @param {string} reason
   */
  resolveSymbol(symbolName, onSymbolResolvedCallback, onResolveErrorCallback) {

    const indexOfColon = symbolName.indexOf(':');

    const normalizeSymbolName = symbolName.substring(indexOfColon + 1);

    const foundSymbolInfo = SYMBOL_DICTIONARY[normalizeSymbolName];

    if(foundSymbolInfo) {

      onSymbolResolvedCallback(foundSymbolInfo);

    }
    else{

      onResolveErrorCallback('symbol info not found!');

    }

  }

  /**
   * This function is called when the chart needs a history fragment defined by dates range.
   * The charting library assumes onHistoryCallback to be called just once.
   *
   * Important: nextTime is a time of the next bar in the history. It should be set if the requested period represents
   * a gap in the data. Hence there is available data prior to the requested period.
   *
   * Important: noData should be set if there is no data in the requested period.
   *
   * Remark: bar.time is expected to be the amount of milliseconds since Unix epoch start in UTC timezone.
   *
   * Remark: bar.time for daily bars is expected to be a trading day (not session start day) at 00:00 UTC. Charting
   * Library adjusts time according to Session from SymbolInfo
   *
   * Remark: bar.time for monthly bars is the first trading day of the month without the time part
   * @param {SymbolInfo} symbolInfo -
   *   {@link    https://github.com/beesEX/charting_library/wiki/Symbology#symbolinfo-structure | SymbolInfo}
   * @param {string} resolution
   * @param {Number} from - unix timestamp, leftmost required bar time
   * @param {Number} to - unix timestamp, rightmost required bar time
   *
   * @callback onHistoryCallback
   * @param {Object[]} bars
   * @param {Number} bars[].time
   * @param {Number} bars[].open
   * @param {Number} bars[].low
   * @param {Number} bars[].high
   * @param {Number} bars[].volume
   * @param {Boolean} meta.noData - true | false
   * @param {Number} meta.nextTime - unix time
   *
   * @callback onErrorCallback
   * @param {string} reason
   *
   * @param {Boolean} firstDataRequest - boolean to identify the first call of this method for the particular symbol
   *   resolution. When it is set to true you can ignore to (which depends on browser's Date.now()) and return bars up
   *   to the latest bar.
   */
  getBars(symbolInfo, resolution, from, to, onHistoryCallback, onErrorCallback, firstDataRequest) {

    if(firstDataRequest) {

      to = Date.now();

    }

    const arrayOfCurrencies = symbolInfo.name.split('_');

    const currency = arrayOfCurrencies[0];

    const baseCurrency = arrayOfCurrencies[1];

    const url = ROUTE_TO_MARKET_OHLCV.replace(':currency', currency)
      .replace(':baseCurrency', baseCurrency)
      .replace(':resolution', resolution)
      .replace(':from', from)
      .replace(':to', to);

    ajax('get', url)
      .then((responseTextFromServer) => {

        const responseObjectFromServer = JSON.parse(responseTextFromServer);

        if(responseObjectFromServer.error) {

          onErrorCallback(responseObjectFromServer.error.message);

        }
        else{

          onHistoryCallback(responseObjectFromServer.data);

        }

      }, (errorMessage) => {

        onErrorCallback(errorMessage);

      });

  }

  /**
   * Charting Library calls this function when it wants to receive real-time updates for a symbol. The Library assumes
   * that you will call onRealtimeCallback every time you want to update the most recent bar or to add a new one.
   *
   * @param {SymbolInfo} symbolInfo -
   *   {@link    https://github.com/beesEX/charting_library/wiki/Symbology#symbolinfo-structure | SymbolInfo}
   * @param {string} resolution
   *
   * @callback onRealtimeCallback -  The Library assumes that you will call onRealtimeCallback every time you want to
   *   update the most recent bar or to add a new one.
   *
   *   Remark: When you call onRealtimeCallback with bar having time
   *   equal to the most recent bar's time then the entire last bar is replaced with the bar object you've passed into
   *   the call.
   *
   * Remark 2: Is it possible either to update the most recent bar or to add a new one with onRealtimeCallback. You'll
   * get an error if you call this function when trying to update a historical bar.
   *
   * Remark 3: There is no way to change historical bars once they've been received by the chart currently.
   *
   * @example
   * 1.The most recent bar is {1419411578413, 10, 12, 9, 11}
   * 2.You call onRealtimeCallback({1419411578413, 10, 14, 9, 14})
   * 3. Library finds out that the bar with the time 1419411578413 already exists and is the most recent one
   * 4. Library replaces the entire bar making the most recent bar {1419411578413, 10, 14, 9, 14}
   *
   * @param {Object} bar
   * @param {Number} bar.time
   * @param {Number} bar.open
   * @param {Number} bar.low
   * @param {Number} bar.high
   * @param {Number} bar.volume
   *
   * @param {Object} subscriberUID
   *
   * @callback onResetCacheNeededCallback - to be executed when bar data has changed
   *
   *
   */
  subscribeBars(symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback) {

    console.log(onResetCacheNeededCallback); // work around eslint no-unused-vars

  }

  /**
   * Charting Library calls this function when it doesn't want to receive updates for this subscriber any more.
   * subscriberUID will be the same object that Library passed to subscribeBars before.
   * @param {Object} subscriberUID
   */
  unsubscribeBars(subscriberUID) {

    console.log(subscriberUID); // work around eslint no-unused-vars

  }

  /**
   * Charting Library calls this function when it is going to request some historical data to give you an ability to
   * override the amount of bars requested.
   *
   * @param {string} resolution - requested symbol resolution
   * @param {string} resolutionBack - time period types. Supported values are: D | M
   * @param {Number} intervalBack - amount of resolutionBack periods that the Charting Library is going to request
   * @return {{resolutionBack, intervalBack}} - return 'undefined' if you do not wish to override anything
   */
  calculateHistoryDepth(resolution, resolutionBack, intervalBack) {

    console.log(intervalBack); // work around eslint no-unused-vars

  }

  /**
   * This function is optional.
   *
   * The Library calls this function to get marks for visible bars range.
   *
   * The Library assumes that you will call onDataCallback only once per getMarks call.
   *
   * A few marks per bar are allowed (for now, the maximum is 10). Marks outside of the bars are not allowed.
   *
   * Remark: This function will be called only if you confirmed that your back-end is supporting marks.
   *
   * @param {SymbolInfo} symbolInfo -
   *   {@link    https://github.com/beesEX/charting_library/wiki/Symbology#symbolinfo-structure | SymbolInfo}
   * @param {Number} from - unix timestamp, leftmost visible bar's time
   * @param {Number} to - unix timestamp, rightmost visible bar's time
   *
   * @callback onDataCallback
   * @param {Object[]} marks
   * @params marks[].id: unique mark ID. It will be passed to a respective callback when user clicks on a mark
   * @params marks[].time: unix time, UTC
   * @params marks[].color: red | green | blue | yellow | { border: '#ff0000', background: '#00ff00' }
   * @params marks[].text: mark popup text. HTML supported
   * @params marks[].label: a letter to be printed on a mark. Single character
   * @params marks[].labelFontColor: color of a letter on a mark
   * @params marks[].minSize: minimum mark size (diameter, pixels) (default value is 5)
   *
   * @param {string} resolution
   */
  getMarks(symbolInfo, from, to, onDataCallback, resolution) {

    console.log(resolution); // work around eslint no-unused-vars

  }

  /**
   * This function is optional.
   *
   * The Library calls this function to get marks for visible bars range.
   *
   * The Library assumes that you will call onDataCallback only once per getTimescaleMarks call.
   *
   * Only one mark per bar is allowed. Marks outside of the bars are not allowed.
   *
   * Remark: This function will be called only if you confirmed that your back-end is supporting marks.
   *
   * @param {SymbolInfo} symbolInfo -
   *   {@link    https://github.com/beesEX/charting_library/wiki/Symbology#symbolinfo-structure | SymbolInfo}
   * @param {Number} from - unix timestamp, leftmost visible bar's time
   * @param {Number} to - unix timestamp, rightmost visible bar's time
   *
   * @callback onDataCallback
   * @param {Object[]} marks
   * @params marks[].id: unique mark ID. It will be passed to a respective callback when user clicks on a mark
   * @params marks[].time: unix time, UTC
   * @params marks[].color: red | green | blue | yellow | { border: '#ff0000', background: '#00ff00' }
   * @params marks[].label: a letter to be printed on a mark. Single character
   * @params marks[].tooltip: array of text strings. Each element of the array is a new text line of a tooltip.
   *
   * @param {string} resolution
   */
  getTimescaleMarks(symbolInfo, from, to, onDataCallback, resolution) {

    console.log(resolution); // work around eslint no-unused-vars

  }

  /**
   *This function is called if the configuration flag supports_time is set to true when the Charting Library needs to know the server time.
   * The Charting Library assumes that the callback is called once.
   * The time is provided without milliseconds.
   * It is used to display Countdown on the price scale.
   *
   * @callback callback
   * @param {Number} unixTime
   * @example 1445324591
   */
  getServerTime(callback) {

    console.log(callback); // work around eslint no-unused-vars
  }

  /**
   * Trading Terminal specific.
   *
   * This function is called when the Charting Library needs quote data. The charting library assumes that
   * onDataCallback is called once when all the requested data is received.
   *
   * @param {string[]} symbols - array of symbols names
   *
   * @callback onDataCallback
   * @param {Object[]} data - array of
   *   {@link https://github.com/beesEX/charting_library/wiki/Quotes#symbol-quote-data |  symbol quote data}
   *
   * @callback onErrorCallback
   * @param {string} reason
   */
  getQuotes(symbols, onDataCallback, onErrorCallback) {

    onErrorCallback('not implemented yet');
  }

  /**
   *Trading Terminal specific.
   *
   * Trading Terminal calls this function when it wants to receive real-time quotes for a symbol.
   * The Charting Library assumes that you will call onRealtimeCallback every time you want to update the quotes.
   *
   * @param {string[]}  symbols - array of symbols that should be updated rarely (once per minute). These symbols are
   *   included in the watchlist but they are not visible at the moment.
   * @param {string[]}  fastSymbols - array of symbols that should be updated frequently (once every 10 seconds or more
   *   often)
   *
   * @callback onRealtimeCallback
   * @param {Object[]} data - array of
   *   {@link https://github.com/beesEX/charting_library/wiki/Quotes#symbol-quote-data |  symbol quote data}
   *
   * @param {Object} listenerGUID unique identifier of the listener
   */
  subscribeQuotes(symbols, fastSymbols, onRealtimeCallback, listenerGUID) {

    console.log(listenerGUID); // work around eslint no-unused-vars

  }

  /**
   *Trading Terminal specific.
   *
   * Trading Terminal calls this function when it doesn't want to receive updates for this listener anymore.
   * listenerGUID will be the same object that the Library passed to subscribeQuotes before.
   *
   @param {Object} listenerGUID unique identifier of the listener
   */
  unsubscribeQuotes(listenerGUID) {

    console.log(listenerGUID); // work around eslint no-unused-vars

  }

  /**
   * Trading Terminal specific.
   *
   * Trading Terminal calls this function when it wants to receive real-time level 2 (DOM) for a symbol. The Charting
   * Library assumes that you will call the callback every time you want to update DOM dat
   *
   * @param {SymbolInfo} symbolInfo -
   *   {@link    https://github.com/beesEX/charting_library/wiki/Symbology#symbolinfo-structure | SymbolInfo}
   *
   * @callback callback
   * @param {Object} depth
   * @param {Boolean} depthsnapshot: Boolean - if true asks and bids have full set of depth, otherwise they contain
   *   only updated levels.
   * @param {Object[]} depthasks
   * @param {Number} depthasks[].price
   * @param {Number} depthasks.volume
   * @param {Object[]} depthbids
   * @param {Number} depthbids[].price
   * @param {Number} depthbids.volume
   *
   * @return {string} a unique identifier (subscriberUID) that will be used to unsubscribe from the data
   */
  subscribeDepth(symbolInfo, callback) {

    console.log(callback); // work around eslint no-unused-vars

    return '';

  }

  /**
   * Trading Terminal specific.
   *
   * Trading Terminal calls this function when it doesn't want to receive updates for this listener anymore
   *
   * @param {string} subscriberUID - will be the same object that was returned from subscribeDepth
   */
  unsubscribeDepth(subscriberUID) {

    console.log(subscriberUID); // work around eslint no-unused-vars
  }

}
