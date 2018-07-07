/**
 * @author son87.lengoc@gmail.com
 * Created by Ngoc Son Le.
 */

import React from 'react';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Util from '../../util/Util';

export default class OrderHistoryTable extends React.Component {

  constructor(props) {

    super(props);

    this.state = {

      orders: []
    };

  }

  push = (order) => {

    this.setState({

      orders: [ order, ...this.state.orders ]

    });
  };

  render() {

    return (

      <Paper>

        <div className={'order-history-table-wrapper'}>

          <Table>

            <TableHead>

              <TableRow>

                <TableCell padding={'dense'}>Type</TableCell>

                <TableCell padding={'dense'}>Side</TableCell>

                <TableCell padding={'dense'}>Currency</TableCell>

                <TableCell padding={'dense'}>Base Currency</TableCell>

                <TableCell padding={'dense'}>Limit</TableCell>

                <TableCell padding={'dense'}>Quantity</TableCell>

                <TableCell padding={'dense'}>Filled</TableCell>

                <TableCell padding={'dense'}>Status</TableCell>

                <TableCell>Placed At</TableCell>

                <TableCell>Updated At</TableCell>

              </TableRow>

            </TableHead>

            <TableBody>

              {
                this.state.orders.map(order => {

                  return (

                    <TableRow key={order._id}>

                      <TableCell padding={'dense'}>{order.type}</TableCell>

                      <TableCell padding={'dense'}>{order.side}</TableCell>

                      <TableCell padding={'dense'}>{order.currency}</TableCell>

                      <TableCell padding={'dense'}>{order.baseCurrency}</TableCell>

                      <TableCell padding={'dense'}>{order.limitPrice}</TableCell>

                      <TableCell padding={'dense'}>{order.quantity}</TableCell>

                      <TableCell padding={'dense'}>{order.filledQuantity}</TableCell>

                      <TableCell padding={'dense'}>{order.status}</TableCell>

                      <TableCell padding={'dense'}>

                        {Util.formatDateToUTC(new Date(order.createdAt))}

                      </TableCell>

                      <TableCell>{Util.formatDateToUTC(new Date(order.lastUpdatedAt))}</TableCell>

                    </TableRow>

                  );

                })

              }

            </TableBody>

          </Table>

        </div>

      </Paper>

    );

  }
}
