/**
 * @author son87.lengoc@gmail.com
 * Created by Ngoc Son Le.
 */


const monthShortHands = [ 'Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.' ];

export default class Util {

  static formatDateToUTC(date) {

    return `${monthShortHands[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}: ${date.getUTCHours()}:${date.getUTCMinutes()}:${date.getUTCSeconds()} UTC`;

  }


}
