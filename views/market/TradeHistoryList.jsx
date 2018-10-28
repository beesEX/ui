import React from 'react';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';

export default class TradeHistoryList extends React.PureComponent {
  constructor(props) {
    super(props);
    this.currency = props.currency;
    this.baseCurrency = props.baseCurrency;
    this.webSocketToServer = props.webSocketToServer;
    this.state = {trades: props.trades};
  }

  componentDidMount() {
    this.webSocketToServer.onMessage((event) => {
      const eventPayload = JSON.parse(event.data);
      if (eventPayload.type === 'ORDER_BOOK_EVENT') {
        const {reason, matches} = eventPayload;

        const newTrades = matches.reverse().map(match =>
          ({ price: match.price,
            quantity: match.tradedQuantity,
            makerSide: reason.side === 'BUY' ? 'SELL' : 'BUY',
            executedAt: match.matchedAt
          })
        );

        const newTradeList = newTrades.concat(this.state.trades);
        this.setState({trades: newTradeList});
      }
    });
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
