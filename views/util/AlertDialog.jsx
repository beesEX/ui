/**
 * @author son87.lengoc@gmail.com
 * Created by Ngoc Son Le.
 */

import TwoButtonsDialog from './TwoButtonsDialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';

export default class AlertDialog extends TwoButtonsDialog {

  renderDialogContent = () => {

    return (

      <DialogContent>

        <DialogContentText>

          {this.props.message}

        </DialogContentText>

      </DialogContent>

    );

  };

}
