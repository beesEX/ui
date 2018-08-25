/**
 * @author tahoang89@gmail.com
 * Created by Hoang Ta.
 */

import React from 'react';
import AggregatedOrderBookColumn from './AggregatedOrderBookColumn';

export default class AggregatedOrderBookTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: window.market.aggregatedOrderBookState
    };
  }

  changeVolumeByPrice = ( {side, price, volumeOffset, filledVolumeOffset} ) => {

  };

  removeVolumeByPrice = ( {side, price} ) => {

  };

  addVolumeByPrice = ( {side, price, volume, filledVolume} ) => {

  };

  render() {
    let { asks, bids, symbol } = this.state.data;
    let symbols = symbol.split('_');
    return (
      <div className={'aggregated-order-table-wrapper'}>
        <AggregatedOrderBookColumn rows={asks} symbols={symbols} type={'asks'}/>
        <AggregatedOrderBookColumn rows={bids} symbols={symbols} type={'bids'}/>
      </div>
    )
  }
}