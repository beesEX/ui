/**
 * @author son87.lengoc@gmail.com
 * Created by Ngoc Son Le.
 */


import React from 'react';
import * as ReactDOM from 'react-dom';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Grid from '@material-ui/core/Grid';
import LimitTradeForm from './LimitTradeForm';
import OrderHistoryTable from './OrderHistoryTable';
import AlertDialog from '../util/AlertDialog';
import UpdateOrderDialog from './UpdateOrderDialog';
import AggregatedOrderBookTable from './AggregatedOrderBookTable';
import {TradingViewChart} from './TradingViewChart';
import WebSocketToServer from '../util/WebSocketToServer';
import TradeHistoryList from "./TradeHistoryList";

const webSocketToServer = new WebSocketToServer(`ws://localhost:8081/market/${window.market.currency}_${window.market.baseCurrency}`);

webSocketToServer.open();

class MarketContent extends React.Component{

  constructor(props) {

    super(props);

    this.state = {

      value: 'limit'

    };

    this.tableRef = React.createRef();

    this.alertDialogRef = React.createRef();

    this.updateOrderDialog = React.createRef();

  }

  changeTab = (event, value) => {

    this.setState({value});

  };

  render() {

    const {value} = this.state;

    return (

      <React.Fragment>
        {/* Chart + Orderbook + Trade History List */}
        <Grid
          container
          direction={'row'}
          style={{height:'660px'}}
        >
          {/* LEFT: Chart */}
          <Grid
            item
            lg={8}
          >
            <TradingViewChart debug={true} interval={'1'} webSocketToServer={webSocketToServer}/>
          </Grid>
          {/* RIGHT: Orderbook + Trade History List */}
          <Grid
            item
            lg={4}
          >
            <Grid container direction={'row'}>
              <Grid item lg={7}>
                <AggregatedOrderBookTable webSocketToServer={webSocketToServer}/>
              </Grid>
              <Grid item lg={5}>
                <TradeHistoryList trades={window.market.lastTrades} currency={window.market.currency} baseCurrency={window.market.baseCurrency}/>
              </Grid>
            </Grid>

          </Grid>

        </Grid>
        {/* Order History + Order Placing Forms */}
        <Grid container direction={'row'}>
          {/* Order History */}
          <Grid item lg={8}>
            <React.Fragment>

              <OrderHistoryTable
                ref={this.tableRef}
                orders={window.market.orders}
                count={window.market.count}
                rowPerPage={window.market.limit}
                alertDialog={this.alertDialogRef}
                updateOrderDialog={this.updateOrderDialog}
                baseCurrency={window.market.baseCurrency}
                currency={window.market.currency}
              />

              <AlertDialog
                ref={this.alertDialogRef}
                title={'Delete'}
                message={'Do you want to delete this order'}
              />

              <UpdateOrderDialog
                fullWidth={true}
                currencyAvailableBalance={this.props.currencyAvailableBalance}
                baseCurrencyAvailableBalance={this.props.baseCurrencyAvailableBalance}
                ref={this.updateOrderDialog}
                title={'Update Order'}
                orderHistoryTable={this.tableRef}
              />
            </React.Fragment>
          </Grid>
          {/* Order Placing Forms */}
          <Grid item lg={4}>
            <Paper>

              <Tabs
                value={value}
                indicatorColor='primary'
                textColor='primary'
                onChange={this.changeTab}
              >

                <Tab
                  value={'limit'}
                  label={'Limit'}
                />

                <Tab
                  value={'market'}
                  label={'Market'}
                />

              </Tabs>

              {

                value === 'limit' &&

                <Grid
                  container
                  className={'market-form-container'}
                >

                  <Grid
                    item
                    xs={6}
                    className={'market-form-buy-part'}
                  >

                    <LimitTradeForm
                      balance={this.props.baseCurrencyAvailableBalance}
                      baseCurrency={window.market.baseCurrency}
                      currency={window.market.currency}
                      action={'BUY'}
                      orderHistoryTable={this.tableRef}
                    />

                  </Grid>

                  <Grid
                    item
                    xs={6}
                    className={'market-form-sell-part'}
                  >

                    <LimitTradeForm
                      balance={this.props.currencyAvailableBalance}
                      baseCurrency={window.market.baseCurrency}
                      currency={window.market.currency}
                      action={'SELL'}
                      orderHistoryTable={this.tableRef}
                    />

                  </Grid>

                </Grid>

              }

              {
                value === 'market' &&
                <div>
                  Market Form
                </div>

              }

            </Paper>
          </Grid>
        </Grid>
      </React.Fragment>

    );
  }
}

ReactDOM.render(<MarketContent
    currency={window.market.currency}
    currencyAvailableBalance={window.market.currencyAvailableBalance}
    baseCurrency={window.market.baseCurrency}
    baseCurrencyAvailableBalance={window.market.baseCurrencyAvailableBalance}
  />,
  document.getElementById('market-content'));

