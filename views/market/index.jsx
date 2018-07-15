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

class MarketContent extends React.Component {

  constructor(props) {

    super(props);

    this.state = {

      value: 'limit'

    };

    this.tableRef = React.createRef();

    this.alertDialogRef = React.createRef();

  }

  changeTab = (event, value) => {

    this.setState({ value });

  };

  render() {

    const { value } = this.state;

    return (

      <div>

        <Typography variant="headline" gutterBottom>

          {this.props.currency}/{this.props.baseCurrency}

        </Typography>

        <hr/>

        <Paper>

          <Tabs
            value={value}
            indicatorColor="primary"
            textColor="primary"
            onChange={this.changeTab}
          >

            <Tab value={'limit'} label={'Limit'}/>

            <Tab value={'market'} label={'Market'}/>

          </Tabs>

          {

            value === 'limit' &&

            <Grid container className={'market-form-container'}>

              <Grid item xs={6} className={'market-form-buy-part'}>

                <LimitTradeForm
                  balance={100}
                  baseCurrency={window.market.baseCurrency}
                  currency={window.market.currency}
                  action={'BUY'}
                  orderHistoryTable={this.tableRef}
                />

              </Grid>

              <Grid item xs={6} className={'market-form-sell-part'}>

                <LimitTradeForm
                  balance={10}
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

        <Typography className={'orderHistoryHeadline'} variant="headline" gutterBottom>

          {'Order History'}

        </Typography>

        <hr/>

        <OrderHistoryTable
          ref={this.tableRef}
          orders={window.market.orders}
          count={window.market.count}
          rowPerPage={window.market.limit}
          alertDialog={this.alertDialogRef}
        />

        <AlertDialog
          ref={this.alertDialogRef}
          title={'Delete'}
          message={'Do you want to delete this order'}
          okClickAction={this.tableRef.current && this.tableRef.current.removeCurrentRow()}
        />


      </div>

    );
  }
}

ReactDOM.render(<MarketContent currency={window.market.currency}
                               baseCurrency={window.market.baseCurrency}/>, document.getElementById('market-content'));

