/**
 * @author tahoang89@gmail.com
 * Created by Hoang Ta.
 */

import React from 'react';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import AggregatedOrderBookColumn from './AggregatedOrderBookColumn';

export default class AggregatedOrderBookTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {"symbol":"BTC_USDT","asks":[{"price":6362.36,"quantity":7.4498,"filledQuantity":5},{"price":6362.37,"quantity":49.99989904,"filledQuantity":30},{"price":6365.07,"quantity":1,"filledQuantity":0},{"price":6365.27,"quantity":1,"filledQuantity":0},{"price":6366.36,"quantity":2.7992,"filledQuantity":0},{"price":6366.47,"quantity":1,"filledQuantity":0},{"price":6366.68,"quantity":11.235100000000001,"filledQuantity":0},{"price":6367.18,"quantity":14.053300000000002,"filledQuantity":0},{"price":6367.46,"quantity":3.243,"filledQuantity":0},{"price":6368,"quantity":5,"filledQuantity":0},{"price":6368.65,"quantity":4,"filledQuantity":0},{"price":6370.87,"quantity":3,"filledQuantity":0},{"price":6371.6,"quantity":1,"filledQuantity":0},{"price":6372.65,"quantity":7.1663,"filledQuantity":0},{"price":6374.3,"quantity":1,"filledQuantity":0},{"price":6375.27,"quantity":4.2,"filledQuantity":0},{"price":6375.28,"quantity":6.2659,"filledQuantity":0},{"price":6375.9,"quantity":24.99994952,"filledQuantity":0},{"price":6377.41,"quantity":24.99994952,"filledQuantity":0},{"price":6377.91,"quantity":24.99994952,"filledQuantity":0},{"price":6379.41,"quantity":24.99994952,"filledQuantity":0},{"price":6381.99,"quantity":3.44,"filledQuantity":0},{"price":6382,"quantity":5,"filledQuantity":0},{"price":6383.33,"quantity":0.15,"filledQuantity":0},{"price":6383.99,"quantity":7.23,"filledQuantity":0},{"price":6384,"quantity":5,"filledQuantity":0},{"price":6384.88,"quantity":0.15,"filledQuantity":0},{"price":6386.4,"quantity":4,"filledQuantity":0},{"price":6386.43,"quantity":0.15,"filledQuantity":0},{"price":6389.42,"quantity":2.6253,"filledQuantity":0},{"price":6389.5,"quantity":0.5,"filledQuantity":0},{"price":6390.8,"quantity":2.19,"filledQuantity":0},{"price":6394.78,"quantity":0.15,"filledQuantity":0},{"price":6397,"quantity":10,"filledQuantity":0},{"price":6397.1,"quantity":0.15,"filledQuantity":0},{"price":6399.24,"quantity":0.15,"filledQuantity":0},{"price":6399.94,"quantity":50,"filledQuantity":0},{"price":6401.2,"quantity":2.19,"filledQuantity":0},{"price":6401.45,"quantity":0.15,"filledQuantity":0},{"price":6403.06,"quantity":0.15,"filledQuantity":0},{"price":6416,"quantity":20,"filledQuantity":0},{"price":6527.56,"quantity":23.8795,"filledQuantity":0}],"bids":[{"price":6009,"quantity":0.01,"filledQuantity":0},{"price":6018,"quantity":0.19870632,"filledQuantity":0},{"price":6205,"quantity":0.01,"filledQuantity":0},{"price":6273,"quantity":0.57503976,"filledQuantity":0},{"price":6294.14,"quantity":5.9514906000000005,"filledQuantity":0},{"price":6295.01,"quantity":4.97068551,"filledQuantity":0},{"price":6296.63,"quantity":0.91568187,"filledQuantity":0},{"price":6296.64,"quantity":1.98383662,"filledQuantity":0},{"price":6300.01,"quantity":16.07426811,"filledQuantity":0},{"price":6301.01,"quantity":33.78547013,"filledQuantity":0},{"price":6308.7,"quantity":3.7,"filledQuantity":0},{"price":6310.95,"quantity":19.87736398,"filledQuantity":0},{"price":6311.01,"quantity":6.95705125,"filledQuantity":0},{"price":6313.01,"quantity":35.68853681999999,"filledQuantity":0},{"price":6315.1,"quantity":3.01,"filledQuantity":0},{"price":6315.11,"quantity":17.244996540000002,"filledQuantity":0},{"price":6316.54,"quantity":0.15,"filledQuantity":0},{"price":6317.26,"quantity":3.3241,"filledQuantity":0},{"price":6317.72,"quantity":18.236808500000002,"filledQuantity":0},{"price":6326.63,"quantity":3.5479,"filledQuantity":0},{"price":6330,"quantity":5,"filledQuantity":0},{"price":6337.13,"quantity":4.1,"filledQuantity":0},{"price":6337.5,"quantity":0.71,"filledQuantity":0},{"price":6339.31,"quantity":0.15,"filledQuantity":0},{"price":6339.4,"quantity":1,"filledQuantity":0},{"price":6340.81,"quantity":1.99,"filledQuantity":0},{"price":6341.18,"quantity":0.15,"filledQuantity":0},{"price":6341.96,"quantity":2.28,"filledQuantity":0},{"price":6342.69,"quantity":0.948731,"filledQuantity":0},{"price":6343.1,"quantity":48.102538,"filledQuantity":0},{"price":6344.69,"quantity":1.897462,"filledQuantity":0},{"price":6345.09,"quantity":24.051269,"filledQuantity":0},{"price":6346.68,"quantity":0.948731,"filledQuantity":0},{"price":6347.28,"quantity":0.99,"filledQuantity":0},{"price":6347.59,"quantity":24.051269,"filledQuantity":0},{"price":6347.7,"quantity":6.2717,"filledQuantity":0},{"price":6349.18,"quantity":0.948731,"filledQuantity":0},{"price":6349.27,"quantity":0.99,"filledQuantity":0},{"price":6349.77,"quantity":0.99,"filledQuantity":0},{"price":6350.01,"quantity":7.1539,"filledQuantity":0},{"price":6350.92,"quantity":14.7235,"filledQuantity":0},{"price":6350.93,"quantity":16.08,"filledQuantity":0},{"price":6351.27,"quantity":0.99,"filledQuantity":0},{"price":6351.43,"quantity":5.630000000000001,"filledQuantity":0},{"price":6351.44,"quantity":4.2,"filledQuantity":0},{"price":6351.5,"quantity":1.007,"filledQuantity":0},{"price":6354.45,"quantity":20.797299999999996,"filledQuantity":0},{"price":6354.46,"quantity":18.7943,"filledQuantity":2.8344},{"price":6354.96,"quantity":12.256,"filledQuantity":2.805},{"price":6354.97,"quantity":11.8753,"filledQuantity":0},{"price":6355.46,"quantity":2.8174,"filledQuantity":0},{"price":6357.73,"quantity":0.9935,"filledQuantity":0.5006999999999997}]}
    };
  }

  changeVolumeByPrice = ( {side, price, volumeOffset, filledVolumeOffset} ) => {

  };

  removeVolumneByPrice = ( {side, price} ) => {

  };

  addVolumeByPrice = ( {side, price, volume, filledVolume} ) => {

  };

  render() {
    let { asks, bids, symbol } = this.state.data;
    let symbols = symbol.split('_');
    return (
      <Paper>
        <div className={'aggregated-order-table-wrapper'}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Asks</TableCell>
                <TableCell>Bids</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow style={{verticalAlign:'top'}}>
                <TableCell><AggregatedOrderBookColumn rows={asks} symbols={symbols} type={'asks'}/></TableCell>
                <TableCell><AggregatedOrderBookColumn rows={bids} symbols={symbols} type={'bids'}/></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </Paper>
    )
  }
}