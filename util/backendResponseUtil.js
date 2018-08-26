/**
 * @author son87.lengoc@gmail.com
 * Created by Ngoc Son Le.
 */

function getErrorFromResponse(data, ...errorTypes) {

  if(data instanceof Error) {

    return {msg: data.message};

  }

  if(data.error) {

    return {msg: data.error.message};

  }

  if(data.errors){

    const error = data.errors[0];

    const msg = error[Object.keys(error)[0]];

    return {msg};

  }

  let errorObject;

  if(errorTypes) {

    for(let i = 0; i < errorTypes.length; i++) {

      const errorType = errorTypes[i];

      if(typeof data === errorType) {

        errorObject = {msg: data};

        break;

      }
    }
  }

  return errorObject;
}

exports.getErrorFromResponse = getErrorFromResponse;
