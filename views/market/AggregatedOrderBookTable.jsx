/**
 * @author tahoang89@gmail.com
 * Created by Hoang Ta.
 */

import React from 'react';
import AggregatedOrderBookColumn from './AggregatedOrderBookColumn';
import Typography from '@material-ui/core/Typography/Typography';
import Grid from '@material-ui/core/Grid';

const ZERO = 1e-12;

const normalizeToZERO = function(value){

  if(value < 0 && value >= -ZERO){

    return 0;

  }

  if(value > 0 && value <= ZERO){

    return 0;

  }

  return value;

}

export default class AggregatedOrderBookTable extends React.PureComponent {
  constructor(props) {
    super(props);
    this.priceLevels = 14;
    this.clientlAsks = window.market.aggregatedOrderBookState.asks.slice();
    this.clientlBids = window.market.aggregatedOrderBookState.bids.slice();
    let asks = this.clientlAsks.slice();
    let bids = this.clientlBids.slice();
    asks.splice(this.priceLevels);
    bids.reverse().splice(this.priceLevels);
    this.state = {
      asks: asks.reverse(),
      bids,
      symbol: window.market.aggregatedOrderBookState.symbol
    };
  }

  componentDidMount() {
    const {symbol} = this.state;

    if(this.props.webSocketToServer) {

      this.props.webSocketToServer.onMessage((event) => {
        const parsedData = JSON.parse(event.data);
        console.log(parsedData);
        if(parsedData.type === 'ORDER_BOOK_EVENT') {
          const {matches, reason: {oldPrice, filledQuantity, type, side, price, quantity, oldQuantity}, filledCompletely} = JSON.parse(event.data); // [Tung]: also destruct 'oldPrice' and 'filledQuantity' fields of reason order
          let tradedQuantity = 0;
          // if matches then check/update also the other side
          if(matches.length) {
            tradedQuantity = this.processMatches(side, matches);
          }
          const sideState = this.getSide(side);
          const index = this.getByPrice(sideState, price);

          switch(type){
            case 'PLACED':
              if(typeof index === 'number') {
                if(filledCompletely) this.changeVolumeByPrice(sideState, index, -quantity, -tradedQuantity);
                else this.changeVolumeByPrice(sideState, index, quantity, tradedQuantity);
              }
              else{
                if(!filledCompletely) this.addPriceLevel(sideState, price, quantity, tradedQuantity);
              }
              break;

            case 'UPDATED':

              let newQuantity = 0, newFilledQuantity = 0;


              if(oldPrice !== price) {   // price changed
                // update the volume of oldPrice
                const oldPriceIndex = this.getByPrice(sideState, oldPrice);
                this.changeVolumeByPrice(sideState, oldPriceIndex, -oldQuantity, -filledQuantity);

                // update the volume of newPrice
                newQuantity += oldQuantity;
                newFilledQuantity += filledQuantity;
              }

              if(oldQuantity !== quantity)
                newQuantity += (quantity - oldQuantity);

              if(typeof index === 'number')
                this.changeVolumeByPrice(sideState, index, newQuantity, newFilledQuantity + tradedQuantity);
              else
                this.addPriceLevel(sideState, price, newQuantity, newFilledQuantity + tradedQuantity);

              break;

            case 'CANCELED':
              this.changeVolumeByPrice(sideState, index, -quantity, -filledQuantity);
              break;
          }

          this.updateSide(side, sideState);
        }
      });
    }
  }

  processMatches = (side, matches) => {
    const counterSide = side === 'SELL' ? 'BUY' : 'SELL';
    const counterSideState = this.getSide(counterSide);
    let traded = 0;
    let savedPriceIndex = [];

    for(let i = 0; i < matches.length; i++) {
      let {price, quantity, tradedQuantity, filledCompletely} = matches[i];
      traded += tradedQuantity;
      const priceStr = price.toString();
      if(!savedPriceIndex[priceStr]) savedPriceIndex[priceStr] = this.getByPrice(counterSideState, price);
      if(filledCompletely) {
        // if this order is filled with this match, that means this order has been filled with amount of ( quantity -
        // tradedQuantity ) before so we decrease the amount of filledQuantity of the price level by ( quantity -
        // tradedQuantity )
        tradedQuantity = -(quantity - tradedQuantity);

        // also decrease the quantity of price level
        quantity = -quantity;

      }
      else quantity = 0;

      if(typeof savedPriceIndex[priceStr] === 'number') {
        this.changeVolumeByPrice(counterSideState, savedPriceIndex[priceStr], quantity, tradedQuantity);
      }
    }

    this.updateSide(counterSide, counterSideState);
    return traded;
  };

  getSide = (side) => side === 'SELL' ? this.clientlAsks : this.clientlBids;

  updateSide = (side, sideState) => {

    let newState = sideState.slice();
    if(side === 'SELL') {
      newState.splice(this.priceLevels);
      newState.reverse();
      this.setState({
        asks: newState
      });
    }
    else{
      newState.reverse().splice(this.priceLevels);
      this.setState({
        bids: newState
      });
    }
    console.log(sideState);
  };
  getByPrice = (side, searchPrice) => {
    for(let i = 0; i < side.length; i++) {
      if(side[i].price === searchPrice) return i;
    }
    return false;
  };

  /**
   * [Tung]: i would refactor this function into two following functions:
   *
   * increaseVolume(volumeArray, indexOfPriceLvl, addedQuantity)
   * increaseFilledVolume(volumeArray, indexOfPriceLvl, addedFilledQuantity)
   *
   * your function named 'changeVolumeByPrice', but it receives an index as input, a little confusing :-)
   */
  changeVolumeByPrice = (side, index, volumeOffset, filledVolumeOffset) => {
    side[index].quantity = normalizeToZERO(side[index].quantity + volumeOffset);
    side[index].filledQuantity = normalizeToZERO(side[index].filledQuantity + filledVolumeOffset);
    const approxDiff = normalizeToZERO(side[index].quantity === side[index].filledQuantity);
    if(approxDiff === 0 || side[index].quantity === 0) this.removePriceLevel(side, index);
  };

  removePriceLevel = (side, index) => {
    if(typeof index !== 'number') return;
    side.splice(index, 1);
  };

  addPriceLevel = (sideState, price, volume, filledQuantity) => {
    const newEl = {
      price,
      quantity: volume,
      filledQuantity
    };

    if(!sideState.length || (sideState.length && price > sideState[sideState.length - 1].price)) {
      console.log('pushed');
      return sideState.push(newEl);
    }

    const insertIndex = sideState.findIndex(el => el.price > price);
    console.log(insertIndex);
    sideState.splice(insertIndex, 0, newEl);
  };

  render() {
    let {asks, bids, symbol} = this.state;
    const symbols = symbol.split('_');
    return (
      <Grid
        container
        className={'aggregated-order-table-wrapper'}
        direction={'column'}
      >
        <Grid item>
          <AggregatedOrderBookColumn
            rows={asks}
            symbols={symbols}
            type={'asks'}
            priceLevels={this.priceLevels}
            className={'aggregated-order-book-row'}

          />
          <AggregatedOrderBookColumn
            rows={bids}
            symbols={symbols}
            type={'bids'}
            priceLevels={this.priceLevels}
            className={'aggregated-order-book-row'}
          />
        </Grid>

      </Grid>
    );
  }
}
