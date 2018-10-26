import React from 'react';
import Paper from '@material-ui/core/Paper';

export default class TradeHistoryList extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = window.market.lastTrades;
  }

  render() {
    let tradeLIEles = this.state.lastTrades.map((trade) => <li>{trade}</li>);
    return (
      <Paper style={{height: '100%'}}>
        <ul>

        </ul>
      </Paper>
    );
  }
}
