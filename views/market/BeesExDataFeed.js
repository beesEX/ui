/**
 * @author son87.lengoc@gmail.com
 * Created by Ngoc Son Le.
 */

import ajax from '../util/ajax';

const {ROUTE_TO_MARKET_OHLCV} = require('../../config/routeDictionary');

const {CHART_SUPPORTED_RESOLUTIONS, SERVER_SUPPORTED_RESOLUTIONS, SYMBOL_DICTIONARY} = require('./chartConfig');

const ONE_MIN_IN_MS = 60 * 1000;

const ONE_HOUR_IN_MS = 60 * ONE_MIN_IN_MS;

const ONE_DAY_IN_MS = 24 * ONE_HOUR_IN_MS;

const ONE_WEEK_IN_MS = 7 * ONE_DAY_IN_MS;

const ONE_MONTH_IN_MS = 31 * ONE_DAY_IN_MS;

/**
 * convert a resolution as string in number of min
 *
 * @param {string} resolution - Format is described in
 *   {@link https://github.com/beesEX/charting_library/wiki/Resolution | the article}.
 * @return {number}BeesExDataFeed.js
 */
function convertResolutionToMS(resolution) {

  const lastCharacter = resolution[resolution.length - 1];

  const resolutionNumber = parseInt(resolution.substring(0, resolution.length - 1), 0);

  switch(lastCharacter) {

    case 'S':

      return resolutionNumber / 60;

    case 'D':

      return resolutionNumber * ONE_DAY_IN_MS;

    case 'W':

      return resolutionNumber * ONE_WEEK_IN_MS;

    case 'M':

      // month has always 31 days
      return resolutionNumber * ONE_MONTH_IN_MS;

    default:

      return parseInt(resolution, 0) * ONE_MIN_IN_MS;

  }

}

function getLastElementFromArray(array) {

  return array[array.length - 1];

}

function isInInterval(start, length, value) {

  const intervalRightThreshold = start + length;

  if(value < intervalRightThreshold) {

    return true;

  }

  return false;

}

function getTradedVolumeAndTradedPrices(arrayOfMatchedOrders) {

  let tradedVolume = 0;

  let lowestTradedPrice = Number.MAX_VALUE;

  let highestTradedPrice = 0;

  let closedPrice = getLastElementFromArray(arrayOfMatchedOrders).price;

  arrayOfMatchedOrders.forEach((matchedOrder) => {

    const {tradedQuantity, price} = matchedOrder;

    tradedVolume += tradedQuantity;

    if(price < lowestTradedPrice) {

      lowestTradedPrice = price;

    }
    else if(price > highestTradedPrice) {

      highestTradedPrice = price;

    }


  });

  return {

    tradedVolume,

    highestTradedPrice,

    lowestTradedPrice,

    closedPrice

  };

}

function createNewBar(resolution, currentBar) {

  return {

    open: currentBar.close,

    close: currentBar.close,

    low: currentBar.close,

    high: currentBar.close,

    time: currentBar.time + resolution,

    volume: 0

  };

}

function updateBar(bar, highestTradedPrice, lowestTradedPrice, closedPrice, quantity) {

  bar.close = closedPrice;

  bar.low = Math.min(bar.low, lowestTradedPrice);

  bar.high = Math.max(bar.high, highestTradedPrice);

  bar.volume += quantity;

}

function updateArrayOfBars(resolution, arrayOfBars, highestTradedPrice, lowestTradedPrice, closedPrice, quantity, time) {

  let lastBar = getLastElementFromArray(arrayOfBars);

  while(!isInInterval(lastBar.time, resolution, time)) {

    lastBar = createNewBar(resolution, lastBar);

    arrayOfBars.push(lastBar);

  }

  updateBar(lastBar, highestTradedPrice, lowestTradedPrice, closedPrice, quantity);

}

function mergeBar(sourceBar, targetBar) {

  targetBar.high = Math.max(sourceBar.high, targetBar.high);

  targetBar.volume += sourceBar.volume;

  targetBar.low = Math.max(sourceBar.low, targetBar.low);

  targetBar.close = sourceBar.close;

}

function calculateClosestStartTimeForResolution(time, resolution) {

  return time - (time % resolution);

}


function findFirstBarOnClientNewerThanLastBarFromServer(arrayOfBarsOnClient, arrayOfBarsFromServer) {

  const lastBarFromServer = getLastElementFromArray(arrayOfBarsFromServer);

  let indexOfFoundBar = 0;

  if(lastBarFromServer) {

    for(let i = 0; i < arrayOfBarsOnClient.length; i++) {

      const barOnClient = arrayOfBarsOnClient[i];

      if(barOnClient.time > lastBarFromServer.time) {

        indexOfFoundBar = i;

        break;

      }

    }

  }

  return indexOfFoundBar;

}

/**
 * This class implements the js data feed interface of the trading view chart
 */
export default class BeesExDataFeed {

  constructor(webSocketToServer) {

    this.webSocketToServer = webSocketToServer;

    this.mapOfResolutionAndMapOfIdAndRealtimeCallbackObject = {};

    this.mapOfResolutionAndArrayOfBars = {};

    if(this.webSocketToServer) {

      SERVER_SUPPORTED_RESOLUTIONS.forEach((resolutionAsString) => {

        const resolutionInMs = convertResolutionToMS(resolutionAsString);

        this.mapOfResolutionAndArrayOfBars[resolutionInMs] = [];

      });

      const orderMatchEventHandler = this.createOrderMatchEventHandler();

      this.websocketHandlerId = this.webSocketToServer.onMessage(orderMatchEventHandler);

    }

  }

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

    // from, to = unix timestamp in s not ms (wrong documented in chart wiki)

    from *= 1000;

    to *= 1000;

    const resolutionInMS = convertResolutionToMS(resolution);

    const arrayOfCurrencies = symbolInfo.name.split('_');

    const currency = arrayOfCurrencies[0];

    const baseCurrency = arrayOfCurrencies[1];

    const url = ROUTE_TO_MARKET_OHLCV.replace(':currency', currency)
      .replace(':baseCurrency', baseCurrency)
      .replace(':resolution', resolutionInMS);

    ajax('get', url, {
      from,
      to
    })
      .then((responseTextFromServer) => {

        const responseObjectFromServer = JSON.parse(responseTextFromServer);

        if(responseObjectFromServer.error) {

          onErrorCallback(responseObjectFromServer.error.message);

        }
        else{

          const noData = responseObjectFromServer.data && responseObjectFromServer.data.length === 0;

          onHistoryCallback(responseObjectFromServer.data, {noData});

          this.mergeBarsFromServerAndClient(resolutionInMS, responseObjectFromServer.data);

          const arrayOfBars = this.mapOfResolutionAndArrayOfBars[resolutionInMS];

          if(arrayOfBars.length > 0) {

            const lastBar = getLastElementFromArray(arrayOfBars);

            this.callRealTimeCallbackUpdatingCurrentBar(resolutionInMS, lastBar.time);

          }

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

    const resolutionInMS = convertResolutionToMS(resolution);

    let mapOfIdAndRealtimeCallback = this.mapOfResolutionAndMapOfIdAndRealtimeCallbackObject[resolutionInMS];

    if(!mapOfIdAndRealtimeCallback) {

      mapOfIdAndRealtimeCallback = {};

      this.mapOfResolutionAndMapOfIdAndRealtimeCallbackObject[resolutionInMS] = mapOfIdAndRealtimeCallback;

    }

    mapOfIdAndRealtimeCallback[subscriberUID] = {

      realTimeCallback: onRealtimeCallback,

      timeOutId: undefined

    };

  }

  /**
   * Charting Library calls this function when it doesn't want to receive updates for this subscriber any more.
   * subscriberUID will be the same object that Library passed to subscribeBars before.
   * @param {Object} subscriberUID
   */
  unsubscribeBars(subscriberUID) {

    console.log(`unsubscribeBars with id = ${subscriberUID}`);

    const arrayOfResolutions = Object.keys(this.mapOfResolutionAndMapOfIdAndRealtimeCallbackObject);

    arrayOfResolutions.forEach((resolution) => {

      const mapOfIdAndRealtimeCallback = this.mapOfResolutionAndMapOfIdAndRealtimeCallbackObject[resolution];

      if(mapOfIdAndRealtimeCallback) {

        const {timeOutId} = mapOfIdAndRealtimeCallback[subscriberUID];

        clearTimeout(timeOutId);

        delete mapOfIdAndRealtimeCallback[subscriberUID];

      }

    });

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

  mergeBarsFromServerAndClient(resolutionInMS, arrayOfBarsFromServer) {

    const arrayOfBarsOnClient = this.mapOfResolutionAndArrayOfBars[resolutionInMS];

    if(arrayOfBarsOnClient.length > 0) {

      const lastBarOnClient = arrayOfBarsOnClient[arrayOfBarsOnClient.length - 1];

      const lastBarFromServer = arrayOfBarsFromServer[arrayOfBarsFromServer.length - 1];

      if(arrayOfBarsFromServer.length > 0) {

        if(lastBarOnClient.time === lastBarFromServer.time) {

          mergeBar(lastBarOnClient, lastBarFromServer);

          this.mapOfResolutionAndArrayOfBars[resolutionInMS] = [lastBarFromServer];

        }
        else{

          const indexOfFirstBar = findFirstBarOnClientNewerThanLastBarFromServer(arrayOfBarsOnClient, arrayOfBarsFromServer);

          const newArrayOfBarsOnClient = [];

          this.mapOfResolutionAndArrayOfBars[resolutionInMS] = newArrayOfBarsOnClient;

          for(let i = indexOfFirstBar; i < arrayOfBarsOnClient.length; i++) {

            newArrayOfBarsOnClient.push(arrayOfBarsOnClient[i]);

            this.callAllRealTimeCallbacksForResolution(resolutionInMS);

          }

        }

      }

    }
    else if(arrayOfBarsFromServer.length > 0) {

      const lastBarFromServer = arrayOfBarsFromServer[arrayOfBarsFromServer.length - 1];

      this.mapOfResolutionAndArrayOfBars[resolutionInMS] = [lastBarFromServer];

    }

  }

  callRealTimeCallbackUpdatingCurrentBar(resolutionInMS) {

    const callTime = new Date();

    console.log(`call at ${callTime.getMinutes()}:${callTime.getSeconds()}:${callTime.getMilliseconds()}`);

    const arrayOfBars = this.mapOfResolutionAndArrayOfBars[resolutionInMS];

    if(arrayOfBars.length > 0) {

      let lastBar = getLastElementFromArray(arrayOfBars);

      const now = Date.now();

      const mapOfIdAndRealTimeCallbackObject = this.mapOfResolutionAndMapOfIdAndRealtimeCallbackObject[resolutionInMS];

      if(mapOfIdAndRealTimeCallbackObject) {

        const arrayOfRealTimeCallbackObjectIds = Object.keys(mapOfIdAndRealTimeCallbackObject);

        while(lastBar.time + resolutionInMS < now) {

          const newBar = createNewBar(resolutionInMS, lastBar);

          arrayOfBars.push(newBar);

          this.callAllRealTimeCallbacksForResolution(resolutionInMS);

          lastBar = newBar;

        }

        this.callAllRealTimeCallbacksForResolution(resolutionInMS);

        const delay = (lastBar.time + resolutionInMS) - now;

        console.log(`delay is ${delay} ms`);

        const nextTimeToCall = new Date(now + delay);

        console.log(`next time add new bar is ${nextTimeToCall.getMinutes()}:${nextTimeToCall.getSeconds()}:${nextTimeToCall.getMilliseconds()}`);

        const timeOutId = setTimeout(() => {

          this.callRealTimeCallbackUpdatingCurrentBar(resolutionInMS);

        }, delay);

        arrayOfRealTimeCallbackObjectIds.forEach((id) => {

          const realTimeCallbackObject = mapOfIdAndRealTimeCallbackObject[id];

          realTimeCallbackObject.timeOutId = timeOutId;

        });

      }
    }

  }

  createOrderMatchEventHandler() {

    return (event) => {

      const {reason, matches, timestamp} = JSON.parse(event.data);

      const time = new Date(timestamp).getTime();

      if(reason.type !== 'CANCELED') {

        if(matches.length > 0) {

          const {price} = reason;

          const {tradedVolume, lowestTradedPrice, highestTradedPrice, closedPrice} = getTradedVolumeAndTradedPrices(matches);

          if(tradedVolume > 0) {

            const arrayOfResolution = Object.keys(this.mapOfResolutionAndArrayOfBars);

            arrayOfResolution.forEach((resolution) => {

              resolution = parseInt(resolution, 0);

              const arrayOfBars = this.mapOfResolutionAndArrayOfBars[resolution];

              if(arrayOfBars.length === 0) {

                arrayOfBars.push({

                  open: price,

                  close: price,

                  high: highestTradedPrice,

                  low: lowestTradedPrice,

                  volume: tradedVolume,

                  time: calculateClosestStartTimeForResolution(time, resolution)

                });

              }
              else{

                updateArrayOfBars(resolution, arrayOfBars, highestTradedPrice, lowestTradedPrice, closedPrice, tradedVolume, time);

              }

              const lastbar = arrayOfBars[arrayOfBars.length - 1];

              this.callRealTimeCallbackUpdatingCurrentBar(resolution, lastbar.time);

            });

          }

        }

      }

    };

  }

  removeWebSocketHandler() {

    this.webSocketToServer.offMessage(this.websocketHandlerId);

  }

  callAllRealTimeCallbacksForResolution(resolutionInMS) {

    const arrayOfBars = this.mapOfResolutionAndArrayOfBars[resolutionInMS];

    const lastBar = arrayOfBars[arrayOfBars.length - 1];

    if(lastBar) {

      const mapOfIdAndRealTimeCallbackObject = this.mapOfResolutionAndMapOfIdAndRealtimeCallbackObject[resolutionInMS];

      const arrayOfRealTimeCallbackObjectIds = Object.keys(mapOfIdAndRealTimeCallbackObject);

      arrayOfRealTimeCallbackObjectIds.forEach((id) => {

        const {realTimeCallback} = mapOfIdAndRealTimeCallbackObject[id];

        realTimeCallback(lastBar);

      });

    }

  }

}
