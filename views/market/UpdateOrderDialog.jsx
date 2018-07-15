/**
 * @author son87.lengoc@gmail.com
 * Created by Ngoc Son Le.
 */

import TwoButtonsDialog from '../util/TwoButtonsDialog';
import LimitTradeForm from './LimitTradeForm';
import DialogContent from '@material-ui/core/DialogContent';

export default class UpdateOrderDialog extends TwoButtonsDialog {

  constructor(props){

    super(props);

    this.formRef = React.createRef();

  }

  renderDialogContent = () => {

    let action = 'BUY';

    let balance = 0;

    let currency = 'BTC';

    let baseCurrency = 'USD';

    if(this.state.order){

      action = this.state.order.side;

      baseCurrency = this.state.order.baseCurrency;

      currency = this.state.order.currency;

      if(action === 'BUY'){

        balance = this.props.baseCurrencyBalance

      }
      else{

        balance = this.props.currencyBalance

      }

    }
    return (

      <DialogContent>

        <LimitTradeForm
          ref={this.formRef}
          notRenderButton={true}
          order={this.state.order}
          action={action}
          balance={balance}
          orderHistoryTable={this.props.orderHistoryTable}
          currency={currency}
          baseCurrency={baseCurrency}

        />

      </DialogContent>

    );

  };

  getForm = () => {

    return this.formRef;

  }

  setOrder = (order) => {

    this.setState({

      order: order

    })

  }
}

