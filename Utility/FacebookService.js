const request = require('request'),
  config = require('config');

const ExchangeToken = (shortLivedToken) => {
  const appID = config.Facebook.appID;
  const appSecret = config.Facebook.appSecret;

  if (!shortLivedToken)
    return Promise.reject("FacebookHandler::ExchangeToken - Invalid short lived token.");
  
  return new Promise((resolve, reject) => {
    request({
      url: 'https://graph.facebook.com/v3.0/oauth/access_token',
      qs: {
        grant_type: 'fb_exchange_token',
        client_id: appID,
        client_secret: appSecret,
        fb_exchange_token: shortLivedToken
      }
    }, (error, response, body) => {
      if (error) { 
        console.log('Token exchange failed.', error); 
        reject({"success": false, "message": "Token exchange failed."});
      }
      
      let exchangedInfo = JSON.parse(body);
      if (exchangedInfo.access_token) {
        console.log("Exchange successful.", exchangedInfo);
        resolve({"success": true, "data": exchangedInfo});
      }else {
        reject({"success": false, "message": "Token exchange failed."});
      }
    });
  });
}

const GetProfileByPSID = (psid, page_access_token, profile_fields) => {

  const defaultFields = ['name','first_name','last_name','profile_pic'];

  let fields = (Array.isArray(profile_fields) && profile_fields.length)? profile_fields: defaultFields,
    fieldsStr = fields.join(',');

  return new Promise ((resolve, reject) => {
    if (psid && page_access_token) {
      request({
        url: `https://graph.facebook.com/${psid}`,
        qs: {
          fields: fieldsStr,
          access_token: page_access_token
        }
      }, (error, response, body) => {
        if (error) { 
          console.log('Fetching facebook profile failed.', error); 
          reject(error);
        }

        try {
          let profieInfo = JSON.parse(body);
          if (profieInfo.error) { 
            reject(profieInfo.error); 
          }else { 
            resolve(profieInfo); 
          }
          
        } catch (error) {
          reject(error);
        }
      });
    }else {
      reject(new Error('Invalid PSID or Page Access Token.'));
    }
  });

}

module.exports = {
  ExchangeToken,
  GetProfileByPSID
}