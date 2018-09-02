import React from 'react';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import Paper from "@material-ui/core/Paper/Paper";

export default class AggregatedOrderBookColumn extends React.Component {
  constructor(props) {
    super(props);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.rows === this.props.rows) return false;
    return true;
  }

  formatNumber = (number, length=10) => number.toString().substr(0, length);

  renderRows = (rows, max) => {
    let arr = [];
    for (let i = 0; i < max; i++) {
      if (rows[i]) {
        arr.push(
          <Grid container key={i} className={'aggregated-order-book-row'}>
            <div className={'percent-filled'}
                 style={ { width: `${Math.round( rows[i].filledQuantity *100 /  rows[i].quantity )}%` } }
            />
            <Grid item xs={3} className={'aggregated-price'}>{ this.formatNumber(rows[i].price) }</Grid>
            <Grid item xs={4}>{ this.formatNumber(rows[i].quantity) }</Grid>
            <Grid item xs={5}>{ this.formatNumber(rows[i].price * rows[i].quantity) }</Grid>
          </Grid>
        )
      } else {
        arr.push(
          <Grid container key={i} className={'aggregated-order-book-row'}>
            &nbsp;
          </Grid>
        )
      }

    }
    return arr;
  };

  render() {
    let { symbols, rows, priceLevels, type } = this.props;
    return (
      <Paper className={`aggregated-table-${type}`}>
        <Grid container>
          <Grid item xs={3}>Price({symbols[1]})</Grid>
          <Grid item xs={4}>Quantity({symbols[0]})</Grid>
          <Grid item xs={5}>Total({symbols[1]})</Grid>
        </Grid>
        <Divider/>
        { this.renderRows(rows, priceLevels || 20) }
      </Paper>
    )
  }
}