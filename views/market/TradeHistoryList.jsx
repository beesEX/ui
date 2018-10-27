import React from 'react';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';

export default class TradeHistoryList extends React.PureComponent {
  constructor(props) {
    super(props);
    this.currency = props.currency;
    this.baseCurrency = props.baseCurrency;
    this.state = {trades: props.trades};
  }

  render() {
    const tradeEles = this.state.trades.map((trade, index) =>
      <li key={index}>
        <Grid container alignContent={'space-between'}>
          <Grid item style={{marginRight: 'auto'}}
                className={trade.makerSide === 'SELL' ? 'trade-history-list-price-item-green' : 'trade-history-list-price-item-red'}>
            {trade.price}
          </Grid>
          <Grid item>{trade.quantity}</Grid>
          <Grid item style={{marginLeft: 'auto'}}>{new Date(trade.executedAt).toLocaleTimeString()}</Grid>
        </Grid>
      </li>
    );

    return (
      <Paper style={{height: '100%'}}>
        <ul className={'trade-history-list'}>{tradeEles}</ul>
      </Paper>
    );
  }
}
