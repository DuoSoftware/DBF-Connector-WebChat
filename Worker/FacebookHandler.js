const request = require('request'),
  config = require('config'),
  fb = require('../Utility/FacebookService');

const ExchangeToken = (req, res, next) => {
  
    let shortLivedToken = req.query['short-lived-token'];

    if (shortLivedToken) {
      fb.ExchangeToken(shortLivedToken).then((response) => {
        console.log("Token exchange success", response);
        res.send(response); next();
      }, (err) => {
        res.end(err.message||"Token exchange failed.");
      });
    }else {
      res.send(403);
    }
}

const SubscribeToApps = (req, res, next) => {
  let payload = req.body;
  if (!payload.pageId) {
    console.log("SubscribeToApps - Invalid page id");
    res.send(400, {"success": false, "message": "Invalid page id"}); next();
  }

  if (!payload.pageToken) {
    console.log("SubscribeToApps - Invalid page access token.");
    res.send(400, {"success": false, "message": "Invalid page access token."}); next();
  }

  fb.SubscribeToApps(payload.pageId, payload.pageToken).then((response) => {
    res.send(response); next();
  }, (err) => {
    res.send(err); next();
  });
}

const UnsubscribeApps = (req, res, next) => {
  let payload = req.body;
  if (!payload.pageId) {
    console.log("UnsubscribeApps - Invalid page id");
    res.send(400, {"success": false, "message": "Invalid page id"}); next();
  }

  if (!payload.pageToken) {
    console.log("UnsubscribeApps - Invalid page access token.");
    res.send(400, {"success": false, "message": "Invalid page access token."}); next();
  }

  fb.UnsubscribeApps(payload.pageId, payload.pageToken).then((response) => {
    res.send(response); next();
  }, (err) => {
    res.send(err); next();
  });
}

module.exports = {
  ExchangeToken,
  SubscribeToApps,
  UnsubscribeApps
}
