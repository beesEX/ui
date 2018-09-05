/**
 * @author tahoang89@gmail.com
 * Created by Hoang Ta.
 */

import React from 'react';
import AggregatedOrderBookColumn from './AggregatedOrderBookColumn';
import Typography from "@material-ui/core/Typography/Typography";

export default class AggregatedOrderBookTable extends React.PureComponent {
  constructor(props) {
    super(props);
    this.priceLevels = 20;

    let asks = window.market.aggregatedOrderBookState.asks.slice();
    let bids = window.market.aggregatedOrderBookState.bids.slice();
    asks.splice(this.priceLevels);
    bids.reverse().splice(this.priceLevels);
    this.state = {
      asks: asks.reverse(), // [Tung]: why not reserve before assigning to state, as done with bids?
      bids,
      symbol: window.market.aggregatedOrderBookState.symbol
    };
  }

  componentDidMount() {
    const { symbol } = this.state;
    const ws = new WebSocket(`ws://localhost:8081/market/${symbol}`); // [Tung]: the WS-channel URL should not be hard coded here, UI server side should render it into some field of window.market
    ws.onmessage = (event) => {
      const parsedData = JSON.parse(event.data);
      console.log(parsedData);
      if (parsedData.type === 'ORDER_BOOK_EVENT' ) {
        const { matches, reason: {type, side, price, quantity, oldQuantity }, filledCompletely } = JSON.parse(event.data);
        let tradedQuantity = 0;
        // if matches then check/update also the other side
        if (matches.length) {
          tradedQuantity = this.progressMatches(side, matches);
        }
        const _side = this.getSide(side); // [Tung]: '_side' var should be renamed to 'sideVolumes' or 'sideState'. Naming the two vars 'side' and '_side' is very confusing, they are different things
        const index = this.getByPrice( _side, price );
        if (filledCompletely) this.removeVolumeByPrice(_side, index); // [Tung]: filledCompletely=true means, the the volumes at that price level should be decreased by quantity, but does not mean, that the volumes at that price level should be removed completely like this.
        else if ( typeof index === "number" ) {
          switch (type) {
            case 'PLACED':
              this.changeVolumeByPrice(_side, index, quantity, tradedQuantity);
              break;
            case 'UPDATED':
              this.changeVolumeByPrice(_side, index, quantity - oldQuantity, 0);
              break;
            case 'CANCELED':
              this.changeVolumeByPrice(_side, index, -quantity, 0);
              break;
          }
        } else {
          if (type==='PLACED') {
            this.addVolumeByPrice(_side, price, quantity, tradedQuantity);
          }
        }
        this.updateSide(side, _side)
      }
    };
  }

  progressMatches = (side, matches) => {
    const _side = side === 'SELL' ? 'BUY' : 'SELL'; // [Tung]: '_side' var should be renamed to 'counterSide'
    const _otherSide = this.getSide( _side ); // [Tung]: '_otherSide' var should be renamed to something like 'counterSideVolumes' or 'counterSideState'. _side and _otherSide are actually different things, of different types, naming them so confuses your code reader very much
    const priceArr = {};
    let traded = 0;
    for (let i = 0; i< matches.length; i++) {
      const { price, quantity, tradedQuantity } = matches[i];
      const priceStr = price.toString();
      traded += tradedQuantity;
      if (typeof priceArr[priceStr] === 'undefined') priceArr[priceStr] = { quantity, tradedQuantity };
      else {
        priceArr[priceStr].quantity += quantity;
        priceArr[priceStr].tradedQuantity += tradedQuantity;
      }
    };

    Object.keys(priceArr).map(price => {
      const _index = this.getByPrice(_otherSide, parseFloat(price));
      if ( typeof _index === "number" ) {
        this.changeVolumeByPrice(_otherSide, _index, 0, priceArr[price].tradedQuantity);
      }
    });
    this.updateSide(_side, _otherSide);
    return traded;
  };

  getSide = (side) => side === 'SELL' ? this.state.asks.slice() : this.state.bids.slice();

  updateSide = (side, newState) => {
    if ( side === 'SELL' ) {
      this.setState({
        asks: newState
      })
    } else {
      this.setState({
        bids: newState
      })
    }
  };
  getByPrice = (side, searchPrice) => {
    for (let i = 0; i<side.length; i++) {
      if ( side[i].price === searchPrice ) return i;
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
  changeVolumeByPrice = ( side, index, volumeOffset, filledVolumeOffset ) => {
    side[index].quantity += volumeOffset;
    side[index].filledQuantity += filledVolumeOffset;
    if ( side[index].quantity === side[index].filledQuantity ) this.removeVolumeByPrice(side, index); // [Tung]: removing a price level should only be done in the refactored function increaseFilledVolume(...)
  };

  /*
  [Tung]: i would rename this function to 'removePriceLvl' or 'removeVolumeOfPriceLvl'
   */
  removeVolumeByPrice = ( side, index ) => {
    if (typeof index !== 'number') return;
    side.splice(index, 1);
  };

  addVolumeByPrice = ( side, price, volume, filledQuantity ) => {
    if (!side.length) {
      side.push({price, quantity: volume, filledQuantity});
    } else {
      side.push({price, quantity: volume, filledQuantity});
      this.sortArray(side);
    }
  };

  sortArray = (arr) => {
    arr.sort( (a, b) => {
      if (a.price > b.price) return -1;
      return 1;
    } );
    return arr.splice( this.priceLevels );
  };

  render() {
    let { asks, bids, symbol } = this.state;
    const symbols = symbol.split('_');
    return (
      <div className={'aggregated-order-table-wrapper'}>
        <Typography
          variant='headline'
          gutterBottom
        >
        </Typography>

        <hr/>
        <AggregatedOrderBookColumn rows={asks} symbols={symbols} type={'asks'} priceLevels={this.priceLevels}/> /* [Tung]: 'type'-attr should be renamed to 'side' to be consistent */
        <AggregatedOrderBookColumn rows={bids} symbols={symbols} type={'bids'} priceLevels={this.priceLevels}/>
      </div>
    )
  }
}
