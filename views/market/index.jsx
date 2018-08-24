/**
 * @author son87.lengoc@gmail.com
 * Created by Ngoc Son Le.
 */


import React from 'react';
import * as ReactDOM from 'react-dom';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import LimitTradeForm from './LimitTradeForm';
import OrderHistoryTable from './OrderHistoryTable';
import AlertDialog from '../util/AlertDialog';
import UpdateOrderDialog from './UpdateOrderDialog';
import AggregatedOrderBookTable from './AggregatedOrderBookTable';

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

      <div>

        <Typography
          variant='headline'
          gutterBottom
        >

          {this.props.currency}/{this.props.baseCurrency}

        </Typography>

        <hr/>

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

              <AggregatedOrderBookTable/>
            </div>

          }

        </Paper>

        <Typography
          className={'orderHistoryHeadline'}
          variant='headline'
          gutterBottom
        >

          {'Order History'}

        </Typography>

        <hr/>

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


      </div>

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

