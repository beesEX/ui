/**
 * @author son87.lengoc@gmail.com
 * Created by Ngoc Son Le.
 */

/* global XMLHttpRequest */

function encodeArray(arrayObject, paramName) {

  let encodedString = '';

  for(const item of arrayObject) {

    encodedString += `&${paramName}=${item}`;

  }

  if(encodedString.length > 0) {

    encodedString = encodedString.substring(1);

  }

  return encodedString;

}

function encodeJSON(jsonObject) {

  let encodedString = '';

  const arrayOfKeys = Object.keys(jsonObject);

  for(const key of arrayOfKeys) {

    encodedString += `&${key}=${jsonObject[ key ]}`;

  }

  if(encodedString.length > 0) {

    encodedString = encodedString.substring(1);

  }

  return encodedString;

}

export default function ajax(method, url, data) {

  return new Promise((resolve, reject) => {

    const request = new XMLHttpRequest();

    request.onreadystatechange = () => {

      if(request.readyState === 4) {

        if(request.status === 200) {

          resolve(request.responseText);

        }
        else{

          reject(request.responseText);
        }


      }

    };

    let dataAsString = '';

    // const csrfToken = (document.getElementById('_csrfToken')).getAttribute('value') || '';

    if(method.toUpperCase() === 'POST' || method.toUpperCase() === 'PUT') {

      request.open(method, url, true);

      request.setRequestHeader('Content-type', 'application/json;charset=utf-8');

      request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

      // request.setRequestHeader('x-csrf-token', csrfToken);

      request.send(JSON.stringify(data));

    }
    else{

      if(data) {

        if(data.renderAsArray) {

          const keys = Object.keys(data);

          let paramName;

          if(keys[ 0 ] === 'renderAsArray') {

            [ , paramName ] = data;

          }
          else{

            [ paramName ] = data;

          }

          const array = data[ paramName ];

          dataAsString = encodeArray(array, paramName);

        }
        else{

          dataAsString = encodeJSON(data);

        }

      }

      request.open(method, `${url}?${dataAsString}`, true);

      // request.setRequestHeader('x-csrf-token', csrfToken);

      request.send();

    }

  });

}
