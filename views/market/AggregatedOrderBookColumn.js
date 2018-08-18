import React from 'react';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';

export default class AggregatedOrderBookColumn extends React.Component {
  constructor(props) {
    super(props);
  }

  renderRows = (rows, max) => {
    let arr = [];
    let count = max < rows.length ? max : rows.length;
    for (let i = 0; i < count; i++) {
      arr.push(
        <Grid container key={i} className={'aggregated-order-book-row'}>
          <div className={'percent-filled'}
               style={ { width: `${Math.round( rows[i].filledQuantity *100 /  rows[i].quantity )}%` } }
           />
          <Grid item xs={3} className={'aggregated-price'}>{rows[i].price}</Grid>
          <Grid item xs={6}>{rows[i].quantity}</Grid>
          <Grid item xs={3}>{rows[i].price * rows[i].quantity}</Grid>
        </Grid>
      )
    }
    return arr;
  };

  render() {
    let { symbols, rows, priceLevels, type } = this.props;
    return (
      <div className={`aggregated-table-${type}`}>
        <Grid container>
          <Grid item xs={3}>Price({symbols[1]})</Grid>
          <Grid item xs={6}>Quantity({symbols[0]})</Grid>
          <Grid item xs={3}>Total({symbols[1]})</Grid>
        </Grid>
        <Divider/>
        { this.renderRows(rows, priceLevels || 20) }
      </div>
    )
  }
}