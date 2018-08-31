/**
 * @author tahoang89@gmail.com
 * Created by Hoang Ta.
 */

import React from 'react';
import AggregatedOrderBookColumn from './AggregatedOrderBookColumn';
import Typography from "@material-ui/core/Typography/Typography";

export default class AggregatedOrderBookTable extends React.Component {
  constructor(props) {
    super(props);
    this.priceLevels = 20;

    let asks = window.market.aggregatedOrderBookState.asks.slice();
    let bids = window.market.aggregatedOrderBookState.bids.slice();
    this.sortArray(asks);
    this.sortArray(bids);

    this.state = {
      asks: asks,
      bids: bids,
      symbol: window.market.aggregatedOrderBookState.symbol
    };
  }

  componentDidMount() {
    const { asks, bids, symbol } = this.state;
    const ws = new WebSocket(`ws://localhost:8081/market/${symbol}`);
    ws.onmessage = (event) => {
      const parsedData = JSON.parse(event.data);
      if (parsedData.type === 'ORDER_BOOK_EVENT' ) {
        const { reason: {side, price, quantity }, filledCompletely } = JSON.parse(event.data);
        const index = this.getByPrice( this.getSide(side), price );
        if ( typeof index === "number" ) {
          if (filledCompletely) return this.removeVolumeByPrice(side, index);
          return this.changeVolumeByPrice(side, index, quantity, 0);
        } else {
          return this.addVolumeByPrice(side, price, quantity, 0);
        }
      }
    };
  }

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

  changeVolumeByPrice = ( side, index, volumeOffset, filledVolumeOffset ) => {
    let _side = this.getSide(side);
    _side[index].quantity += volumeOffset;
    this.updateSide(side, _side);
  };

  removeVolumeByPrice = ( side, index ) => {
    this.updateSide(side, this.getSide(side).splice(index, 1));
  };

  addVolumeByPrice = ( side, price, volume, filledVolume ) => {
    let _side = this.getSide(side);
    _side.push({price, quantity: volume, filledVolume});
    this.sortArray(_side);
    this.updateSide(side, _side);
  };

  sortArray = (arr) => {

    arr.sort( (a, b) => {
      if (a.price > b.price) return -1;
      return 1;
    } );
    arr.splice(this.priceLevels);
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
        <AggregatedOrderBookColumn rows={asks} symbols={symbols} type={'asks'} priceLevels={this.priceLevels}/>
        <AggregatedOrderBookColumn rows={bids} symbols={symbols} type={'bids'} priceLevels={this.priceLevels}/>
      </div>
    )
  }
}