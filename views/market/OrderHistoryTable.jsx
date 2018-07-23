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
import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';

export default class OrderHistoryTable extends React.Component {

  constructor(props) {

    super(props);

    this.state = {

      orders: props.orders || [],

      page: 0,

      count: props.count || ((props.orders) ? props.orders.length : 0),

      rowPerPage: this.props.rowPerPage || 10

    };

  }

  push = (order) => {

    let newArrayOfOrders;

    if(this.state.count >= this.rowPerPage){

      newArrayOfOrders = [ order, ...this.state.orders.slice(0, this.state.orders.length - 1) ];

    }
    else{

      newArrayOfOrders =  [ order, ...this.state.orders];
    }
    this.setState({

      count: this.state.count + 1,

      orders: newArrayOfOrders

    });
  };

  handleChangePage = (event, page) => {

    const options = {

      offset: Util.convertPageToOffset(page, this.state.rowPerPage),

      limit: this.state.rowPerPage

    };

    ajax('GET', '/order/history', options)
      .then((responseText) => {

        const data = JSON.parse(responseText);

        if(data.error) {

          console.error(data.error);

        }
        else{

          this.setState({

            orders: data.orders,

            count: data.count,

            page: page

          });

        }

      });
  };

  createDeleteButtonClickHandler = (order) => {

    return () => {

      const alertDialog = this.props.alertDialog.current;

      alertDialog && alertDialog.show();

      let page = this.state.page;

      if(this.state.page > 0 && this.state.orders.length === 1) {

        page = this.state.page - 1;
      }

      const dataToSent = {

        orderId: order._id,

        offset: Util.convertPageToOffset(page, this.state.rowPerPage),

        limit: this.state.rowPerPage

      };

      alertDialog.setOkClickHandler(() => {

        ajax('POST', '/order/cancel', dataToSent)
          .then((responseText) => {

            const parsedResponse = JSON.parse(responseText);

            if(parsedResponse.error) {

              console.log(parsedResponse.error);

            }
            else{

              this.setState({

                orders: parsedResponse.orders,

                count: parsedResponse.count,

              });

            }

          });

      });

    };

  };

  createEditButtonClickHandler = (order, index) => {

    return () => {

      const updateDialog = this.props.updateOrderDialog.current;

      updateDialog && updateDialog.show();

      updateDialog.setOrder(order);

      updateDialog.setOkClickHandler(() => {

        const orderToUpdate = order;

        orderToUpdate.limitPrice = updateDialog.getForm()
          .current
          .getCurrentPrice();

        orderToUpdate.quantity = updateDialog.getForm()
          .current
          .getCurrentQuantity();

        ajax('POST', '/order/update', orderToUpdate)
          .then((responseText) => {

            const parsedResponse = JSON.parse(responseText);

            if(parsedResponse.error) {

              console.log(parsedResponse.error);

            }
            else{

              if(this.state.page > 0) {

                this.handleChangePage(null, this.state.page);

              }
              else{

                const originalArrayOfOrders = this.state.orders;

                originalArrayOfOrders.splice(index, 1);

                this.setState({

                  orders: [ parsedResponse.updatedOrder, ...originalArrayOfOrders ]

                });

              }


            }

          });

      });

    };

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

                <TableCell>Actions</TableCell>

              </TableRow>

            </TableHead>

            <TableBody>

              {
                this.state.orders.map((order, index) => {

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

                      <TableCell>

                        <Grid container={true}>

                          <Tooltip title={'Delete'} placement={'left'}>

                            <IconButton color={'secondary'}
                                        onClick={this.createDeleteButtonClickHandler(order)}>

                              <Icon>delete</Icon>

                            </IconButton>

                          </Tooltip>

                          <Tooltip title={'Edit'} placement={'left'}>

                            <IconButton color={'primary'}
                                        onClick={this.createEditButtonClickHandler(order, index)}>

                              <Icon>edit</Icon>

                            </IconButton>

                          </Tooltip>

                        </Grid>

                      </TableCell>

                    </TableRow>

                  );

                })

              }

            </TableBody>

            <TableFooter>
              <TableRow>
                <TablePagination
                  colSpan={11}
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
