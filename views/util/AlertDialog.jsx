/**
 * @author son87.lengoc@gmail.com
 * Created by Ngoc Son Le.
 */

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import DialogContentText from '@material-ui/core/DialogContentText';

export default class AlertDialog extends React.Component {

  constructor(props) {

    super(props);

    this.state = {

      open: false,

      onOkClick: undefined

    };

  }

  shouldComponentUpdate = (nextProps, nextState) => {

    if(nextState.open != this.state.open) {

      return true;

    }

    return false;

  };

  setOkClickHandler = (handler) => {

    this.setState({

      onOkClick: handler

    });
  };

  createCloseHandler = (action) => {

    if(action === 'cancel') {

      return () => {

        this.setState({

          open: false

        });

      };

    }

    return () => {

      this.state.onOkClick && this.state.onOkClick();

      this.setState({

        open: false

      });

    };


  };

  show = () => {

    this.setState({

      open: true

    });
  };

  render() {

    return (

      <Dialog

        open={this.state.open}

        onClose={this.handleClose}

      >

        <DialogTitle>{this.props.title}</DialogTitle>

        <DialogContent>

          <DialogContentText>

            {this.props.message}

          </DialogContentText>

        </DialogContent>

        <DialogActions>

          <Button onClick={this.createCloseHandler('cancel')} color="secondary" autoFocus>

            {this.props.cancelButtonText || 'Cancel'}

          </Button>

          <Button onClick={this.createCloseHandler('ok')} color="primary">

            {this.props.okButtonText || 'OK'}

          </Button>

        </DialogActions>

      </Dialog>
    );
  }
}
