const request = require('request'),
  config = require('config');

const ExchangeToken = (shortLivedToken) => {
  const appID = config.Facebook.appID; //'877968375673377';
  const appSecret = config.Facebook.appSecret; //'11c1f55e2a958d1bdba7bebe51a6fb6b';

  if (!shortLivedToken) {
    console.log("FacebookHandler::ExchangeToken - Invalid short lived token.");
    return Promise.reject("FacebookHandler::ExchangeToken - Invalid short lived token.");
  }
  
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

const SubscribeToApps = (pageId, pageToken) => {
  if (!pageId) {
    console.log("FacebookHandler::SubscribeToApps - Invalid page id");
    return Promise.reject("FacebookHandler::SubscribeToApps - Invalid page id");
  }

  if (!pageToken) {
    console.log("FacebookHandler::SubscribeToApps - Invalid page access token.");
    return Promise.reject("FacebookHandler::SubscribeToApps - Invalid page access token.");
  }
  
  return new Promise((resolve, reject) => {
    request({
      method: 'POST',
      url: `https://graph.facebook.com/v3.3/${pageId}/subscribed_apps`,
      qs: {subscribed_fields: "messages, messaging_postbacks, messaging_optins, message_deliveries, message_reads, messaging_referrals"},
      json: {access_token: pageToken}
    }, (error, response, body) => {
      if (error) { 
        console.log('Failed to subscribe to the app', error); 
        reject({"success": false, "message": "", "data": error});
      }
      
      if (body.success || body.success === "true") {
        console.log("Successfully subscribe to the app");
        resolve({"success": true});
      } else {
        console.log('Failed to subscribe the app'); 
        reject({"success": false});
      }
    });
  });
}

const UnsubscribeApps = (pageId, pageToken) => {
  if (!pageId) {
    console.log("FacebookHandler::UnsubscribeApps - Invalid page id");
    return Promise.reject("FacebookHandler::UnsubscribeApps - Invalid page id");
  }

  if (!pageToken) {
    console.log("FacebookHandler::UnsubscribeApps - Invalid page access token.");
    return Promise.reject("FacebookHandler::UnsubscribeApps - Invalid page access token.");
  }
  
  return new Promise((resolve, reject) => {
    request({
      method: 'DELETE',
      url: `https://graph.facebook.com/v3.3/${pageId}/subscribed_apps`,
      json: {access_token: pageToken}
    }, (error, response, body) => {
      if (error) { 
        console.log('Failed to unsubscribe the app', error); 
        reject({"success": false, "message": "Failed to unsubscribe the app", "data": error});
      }
      
      if (body.success || body.success === "true") {
        console.log("Successfully unsubscribe the app");
        resolve({"success": true});
      } else {
        console.log('Failed to unsubscribe the app'); 
        reject({"success": false});
      }
    });
  });
}

module.exports = {
  ExchangeToken,
  GetProfileByPSID,
  SubscribeToApps,
  UnsubscribeApps
}