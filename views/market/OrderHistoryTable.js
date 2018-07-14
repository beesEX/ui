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
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import ajax from '../util/ajax';

export default class OrderHistoryTable extends React.Component {

  constructor(props) {

    super(props);

    this.state = {

      orders: props.orders || [],

      page: 0,

      count: props.count || ((props.orders) ? props.orders.length : 0),

      rowPerPage : this.props.rowPerPage || 10

    };

    console.log(this.state);

  }

  push = (order) => {

    this.setState({

      count: this.state.count +1,

      orders: [ order, ...this.state.orders.slice(0,this.state.orders.length-1) ]

    });
  };

  handleChangePage = (event, page) => {

    const options = {

      offset: Math.max(page * this.state.rowPerPage, 0),

      limit: this.state.rowPerPage

    };

    ajax('GET', '/order/history', options).then( (responseText) => {

      const data = JSON.parse(responseText);

      if(data.error){

        console.error(data.error);

      }
      else{

        this.setState({

          orders: data.orders,

          count: data.count,

          page: page

        })

      }

    })
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

            <TableFooter>
              <TableRow>
                <TablePagination
                  colSpan={10}
                  count={this.state.count}
                  rowsPerPage={this.state.rowPerPage}
                  rowsPerPageOptions={[]}
                  page={this.state.page}
                  onChangePage={this.handleChangePage}
                />
              </TableRow>
            </TableFooter>

          </Table>

        </div>

      </Paper>

    );

  }
}
