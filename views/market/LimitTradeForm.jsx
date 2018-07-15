/**
 * @author son87.lengoc@gmail.com
 * Created by Ngoc Son Le.
 */


import React from 'react';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core//InputLabel';
import Input from '@material-ui/core//Input';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputAdornment from '@material-ui/core/InputAdornment';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Icon from '@material-ui/core/Icon';
import ajax from '../util/ajax';
import Order from '../../models/Order';

function getDefaultState(props) {

  let priceValue = NaN;

  let priceError = true;

  let quantityValue = NaN;

  let quantityError = true;

  if(props.order) {

    priceValue = props.order.limitPrice;

    priceError = false;

    quantityValue = props.order.quantity;

    quantityError = false;

  }

  return {

    price: {

      value: priceValue,

      error: priceError,

      helperText: 'Input a price greater or equal 0',

      errorText: 'Input a price greater or equal 0'

    },

    quantity: {

      value: quantityValue,

      error: quantityError,

      helperText: `Input quantity between 0 und ${props.balance}`,

      errorText: `Input quantity between 0 und ${props.balance}`

    }

  };
}

export default class LimitTradeForm extends React.Component {

  constructor(props) {

    super(props);

    this.state = getDefaultState(props);

  }

  createChangeHandler = (propertyName) => (event) => {

    const newState = {};

    const newValue = parseFloat(event.target.value);

    const objectToUpdate = Object.assign({}, this.state[ propertyName ]);

    newState[ propertyName ] = objectToUpdate;

    objectToUpdate.value = newValue;

    let noError = true;

    if(Number.isNaN(newValue) || newValue < 0) {

      objectToUpdate.error = true;

      if(propertyName === 'price') {

        objectToUpdate.errorText = 'Price has to be greater or equal 0';

      }
      else{

        objectToUpdate.errorText = `Quantity has to be a number between 0 and ${this.props.balance}`;

      }

      noError = false;

    }

    if(propertyName === 'quantity' && newValue > this.props.balance) {

      objectToUpdate.error = true;

      objectToUpdate.errorText = `Quantity has to be a number between 0 and ${this.props.balance}`;

      noError = false;

    }

    if(noError) {

      objectToUpdate.error = false;

      objectToUpdate.errorText = '';

    }

    this.setState(newState);

  };

  getCurrentPrice = () => {

    return this.state.price.value;

  };

  getCurrentQuantity = () => {

    return this.state.quantity.value;

  };

  submit = () => {

    const order = new Order('LIMIT', this.props.action, this.props.currency, this.props.baseCurrency, this.state.price.value, this.state.quantity.value);

    const jsonToSend = order.toJSON();

    ajax('POST', '/order/place', jsonToSend)
      .then(
        (responseText) => {

          const responseObject = JSON.parse(responseText);

          if(responseObject.errors) {

            const errors = responseObject.errors;

            if(typeof errors === 'object') {

              let newState = {};

              const propertyNames = [ 'price', 'quantity' ];

              let objectToUpdate;

              for(const propertyName of propertyNames) {

                if(errors[ propertyName ]) {

                  objectToUpdate = Object.assign({}, this.state[ propertyName ]);

                  objectToUpdate.error = true;

                  objectToUpdate.errorText = errors[ propertyName ];

                  newState[ propertyName ] = objectToUpdate;

                }


              }

              this.setState(newState);

            }
          }
          else if(responseObject.createdOrder && this.props.orderHistoryTable) {

            if(this.props.orderHistoryTable.current) {

              this.props.orderHistoryTable.current.push(responseObject.createdOrder);

            }

            this.setState(getDefaultState(this.props));

          }

        }
        ,
        (errorText) => {

          console.log(errorText);

        });
  };

  renderButton = (text, color) => {

    const renderButton = !this.props.notRenderButton;

    if(renderButton) {

      return (

        <Button variant="contained"
                color={color}
                disabled={this.state.price.error || this.state.quantity.error}
                className={'market-form-submit-button'}
                onClick={this.submit}
        >

          {text}

        </Button>

      );

    }

  };

  render() {

    let buttonText,

      buttonColor,

      balanceCurrency,

      totalHelperText,

      total,

      idPrefix = `market-limit-${this.props.action.toLowerCase()}`;

    if(Number.isNaN(this.state.quantity.value) || Number.isNaN(this.state.price.value)) {

      total = '';

    }
    else{

      total = (this.state.quantity.value * this.state.price.value).toFixed(10);

    }

    if(this.props.action === 'BUY') {


      buttonColor = 'primary';

      buttonText = `Buy ${this.props.currency}`;

      balanceCurrency = this.props.baseCurrency;

      if(total) {

        totalHelperText = `Buy ${this.state.quantity.value} ${this.props.currency} für ${total} ${this.props.baseCurrency}`;

      }

    }
    else{

      buttonColor = 'secondary';

      buttonText = `Sell ${this.props.currency}`;

      balanceCurrency = this.props.currency;

      if(total) {

        totalHelperText = `Sell ${this.state.quantity.value} ${this.props.currency} für ${total} ${this.props.baseCurrency}`;

      }

    }

    return (

      <Grid container direction={'column'}>

        <Grid item>

          <Grid container>

            <Grid item xs={6}>

              <Typography variant="title" gutterBottom>{buttonText}</Typography>

            </Grid>

            <Grid item xs={1}>

              <Icon>account_balance</Icon>

            </Grid>

            <Grid item xs={4}>

              <Typography>{this.props.balance}</Typography>

            </Grid>

            <Grid item xs={1}>

              <Typography align={'right'}>{balanceCurrency}</Typography>

            </Grid>

          </Grid>

        </Grid>

        <FormControl className={'market-input'}>

          <InputLabel required htmlFor={`${idPrefix}-price`}
                      className={'market-input-label'}>Preis</InputLabel>

          <Input
            id={`${idPrefix}-price`}
            value={Number.isNaN(this.state.price.value) ? '' : this.state.price.value}
            type={'number'}
            onChange={this.createChangeHandler('price')}
            endAdornment={<InputAdornment
              position="end">{this.props.baseCurrency}</InputAdornment>}
            inputProps={{
              'aria-label': 'Price',
              'min': 0,
              'step': 0.001
            }}
          />

          <FormHelperText error={this.state.price.error}>

            {this.state.price.error ? this.state.price.errorText : this.state.price.helperText}

          </FormHelperText>

        </FormControl>

        <FormControl className={'market-input'}>

          <InputLabel required htmlFor={`${idPrefix}-quantity`}
                      className={'market-input-label'}>Betrag</InputLabel>

          <Input
            id={`${idPrefix}-quantity`}
            value={Number.isNaN(this.state.quantity.value) ? '' : this.state.quantity.value}
            type={'number'}
            onChange={this.createChangeHandler('quantity')}
            endAdornment={<InputAdornment position="end">{this.props.currency}</InputAdornment>}
            inputProps={{
              'aria-label': 'Quantity',
              'min': 0,
              'max': this.props.balance,
              'step': 0.001
            }}
          />

          <FormHelperText error={this.state.quantity.error}>

            {this.state.quantity.error ? this.state.quantity.errorText : this.state.quantity.helperText}

          </FormHelperText>

        </FormControl>

        <FormControl className={'market-total-input'}>

          <InputLabel htmlFor={`${idPrefix}-total`}
                      className={'market-input-label'}>Total</InputLabel>

          <Input
            id={`${idPrefix}-total`}
            value={Number.isNaN(total) ? '' : total}
            endAdornment={<InputAdornment position="end">{this.props.baseCurrency}</InputAdornment>}
            inputProps={{
              'aria-label': 'Total',
              'readOnly': 'true'
            }}
          />

          <FormHelperText error={this.state.price.error || this.state.quantity.error}>

            {totalHelperText}

          </FormHelperText>

        </FormControl>

        {this.renderButton(buttonText, buttonColor)}

      </Grid>
    );
  }

}