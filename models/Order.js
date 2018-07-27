/**
 * @author son87.lengoc@gmail.com
 * Created by Ngoc Son Le.
 */

const validator = require('validator');
const Constant = require('../util/Constant');
const SupportedCurrencies = require('../util/SupportedCurrencies');

class Order {

  constructor(type, side, currency, baseCurrency, price, quantity) {

    this.type = type;

    this.side = side;

    this.currency = currency;

    this.baseCurrency = baseCurrency;

    this.price = price;

    this.quantity = quantity;

    this.properties = [ 'type', 'side', 'currency', 'baseCurrency', 'price', 'quantity' ];

  }

  validate(balance) {

    const errorContainer = {};

    this.validateExist(errorContainer);

    if(!errorContainer.type && !validator.isIn(this.type, [ Constant.LIMIT, Constant.MARKET ])) {

      errorContainer.type = `Type has to be either ${Constant.LIMIT} or ${Constant.MARKET}`;

    }

    if(!errorContainer.side && !validator.isIn(this.side, [ Constant.BUY, Constant.SELL ])) {

      errorContainer.side = `Side has to be either ${Constant.BUY} or ${Constant.SELL}`;

    }

    if(!errorContainer.currency && !validator.isIn(this.currency, SupportedCurrencies)) {

      errorContainer.currency = `Currency has to be one of ${SupportedCurrencies}`;

    }

    if(!errorContainer.baseCurrency && !validator.isIn(this.baseCurrency, SupportedCurrencies)) {

      errorContainer.baseCurrency = `BaseCurrency has to be one of ${SupportedCurrencies}`;

    }

    const options = {

      min: 0

    };

    if(!errorContainer.price
      &&
      (
        !validator.isFloat(this.price.toString(), options)
        && !validator.isInt(this.price.toString(), options)
      )

    ) {

      errorContainer.price = 'Price has to be a number and greater or equal 0';

    }

    if(balance) {

      options.max = balance;

    }

    if(!errorContainer.quantity
      &&
      (
        !validator.isFloat(this.quantity.toString(), options)
        && !validator.isInt(this.quantity.toString(), options)
      )

    ) {

      errorContainer.quantity = 'Quantity has to be a number and greater or equal 0';

      if(balance) {

        errorContainer.quantity += ` and smaller or equal ${balance}`;

      }

    }

    return errorContainer;

  }

  validateExist(errorContainer) {

    let isEmpty;

    let propertyValue;

    for(const propertyName of this.properties) {

      propertyValue = this[ propertyName ];

      isEmpty = validator.isEmpty(propertyValue.toString());

      if(isEmpty) {

        errorContainer[ propertyName ] = `${propertyName} is empty`;

      }

    }

  }

  toJSON() {

    return {

      type: this.type,

      side: this.side,

      currency: this.currency,

      baseCurrency: this.baseCurrency,

      limitPrice: this.price,

      quantity: this.quantity

    };

  }

  static fromJSON(json) {

    return new Order(
      json.type,
      json.side,
      json.currency,
      json.baseCurrency,
      json.limitPrice,
      json.quantity
    );

  }

}

module.exports = Order;
