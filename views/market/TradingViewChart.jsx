/**
 * @author son87.lengoc@gmail.com
 * Created by Ngoc Son Le.
 */

import * as React from 'react';
import {widget} from '../../public/charting_library/charting_library.min';
import Paper from '@material-ui/core/Paper';
import BeesExDataFeed from './BeesExDataFeed';

function getLanguageFromURL() {
  const regex = new RegExp('[\\?&]lang=([^&#]*)');
  const results = regex.exec(window.location.search);
  return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

export class TradingViewChart extends React.PureComponent{
  static defaultProps = {
    symbol: 'BTC_USDT',
    interval: 'D',
    containerId: 'tv_chart_container',
    libraryPath: '/charting_library/',
    chartsStorageUrl: '', // TODO
    chartsStorageApiVersion: '1.1',
    clientId: 'tradingview.com',
    userId: 'public_user_id',
    fullscreen: false,
    autosize: true,
    studiesOverrides: {},
    debug: false,
    allow_symbol_change: false
  };

  tvWidget = null;

  componentDidMount() {
    const widgetOptions = {
      symbol: this.props.symbol,
      // BEWARE: no trailing slash is expected in feed URL
      datafeed: new BeesExDataFeed(),
      interval: this.props.interval,
      container_id: this.props.containerId,
      library_path: this.props.libraryPath,

      locale: getLanguageFromURL() || 'en',
      disabled_features: ['use_localstorage_for_settings','header_symbol_search'],
      enabled_features: ['study_templates'],
      charts_storage_url: this.props.chartsStorageUrl,
      charts_storage_api_version: this.props.chartsStorageApiVersion,
      client_id: this.props.clientId,
      user_id: this.props.userId,
      fullscreen: this.props.fullscreen,
      autosize: this.props.autosize,
      studies_overrides: this.props.studiesOverrides,
      debug: this.props.debug,
      allow_symbol_change: this.props.allow_symbol_change
    };

    const tvWidget = new widget(widgetOptions);
    this.tvWidget = tvWidget;

    tvWidget.onChartReady(() => {
      const button = tvWidget.createButton().attr('title', 'Click to show a notification popup').addClass('apply-common-tooltip').on('click', () => tvWidget.showNoticeDialog({
        title: 'Notification',
        body: 'TradingView Charting Library API works correctly',
        callback: () => {
          console.log('Noticed!');
        }
      }));

      button[0].innerHTML = 'Check API';
    });
  }

  componentWillUnmount() {
    if(this.tvWidget !== null) {
      this.tvWidget.remove();
      this.tvWidget = null;
    }
  }

  render() {

    return (

      <Paper>

        <div
          id={this.props.containerId}
          className={'tradingViewChartContainer'}
        />

      </Paper>

    );
  }
}
