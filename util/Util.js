/**
 * @author son87.lengoc@gmail.com
 * Created by Ngoc Son Le.
 */


const monthShortHands = [ 'Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.' ];

export default class Util {

  static formatDateToUTC(dateObject) {

    const date = Util.convertToTwoDigitNumber(dateObject.getUTCDate());

    const year = dateObject.getUTCFullYear();

    const hour = Util.convertToTwoDigitNumber(dateObject.getUTCHours());

    const second = Util.convertToTwoDigitNumber(dateObject.getUTCSeconds());

    const minute = Util.convertToTwoDigitNumber(dateObject.getUTCMinutes());

    return `${monthShortHands[ dateObject.getUTCMonth() ]} ${date}, ${year}: ${hour}:${minute}:${second} UTC`;

  }

  static convertToTwoDigitNumber(numberToConvert) {

    if(numberToConvert < 0) {

      throw new Error(`number ${numberToConvert} has to be greater than -1`);

    }

    if(!Number.isInteger(numberToConvert)) {

      throw new Error(`number ${numberToConvert} has to be an integer`);

    }

    if(numberToConvert < 10) {

      return `0${numberToConvert}`;

    }

    return `${numberToConvert}`;

  }

  static convertPageToOffset(page, rowPerPage) {

    return Math.max(page * rowPerPage, 0);
  }


}
