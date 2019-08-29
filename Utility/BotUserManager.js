const request = require("request"),
  config = require('config'),
  redisManager = require('./RedisManager'),
  fb = require('./FacebookService'),
  BotService = require('./BotService');

let redis = new redisManager();

const getBotUserStruct = (user_name, email, psid, bot_id, desc) => {
  if (user_name && psid && bot_id) {
    return {
      userName: user_name,
      email: email || psid,
      botUniqueId: psid,
      bot: bot_id,
      roles: [],
      groups:  [],
      description: desc || "This a bot user",
      enable: true,
      botUser:true,	
    }
  }
}

const createBotUser = (user, tenant, company) => {

  if (!config.Services || !config.Services.botServiceHost)
    return Promise.reject("Required environment variables not provided.('Services')");

  if (!user || !tenant || !company)
    return Promise.reject("BotUserManager::createBotUser - Required method parameters not provided.");

  const SRVConfig = config.Services,
    SRVUrl = `${SRVConfig.botServiceProtocol || 'https'}://${SRVConfig.botServiceHost}/DBF/API/${SRVConfig.botServiceVersion || '1.0.0.0'}/User/`; // https://<host>/DBF/API/1.0.0.0/User

  return new Promise((resolve, reject) => {
    request({
      method: "POST",
      url: SRVUrl,
      json: user,
      headers: {
        authorization: `bearer ${SRVConfig.accessToken}`,
        companyinfo: `${tenant}:${company}`
      }
    }, (err, response, body) => {
      if (err) { reject(err); }
      try {
        if (body && body.IsSuccess) {
          resolve(user);
        } else {
          reject(new Error(`Error getting while creating user.`));
        }
      } catch (ex) {
        reject(ex);
      }
    });
  });
}

const getBotUserByPSID = (psid, tenant, company) => {
  if (!config.Services || !config.Services.botServiceHost)
    return Promise.reject("Required environment variables not provided.('Services')");

  if (!psid || !company || !tenant)
    return Promise.reject("BotUserManager::getBotUserByPSID - Invalid method parameters.");

  const SRVConfig = config.Services,
    SRVUrl = `${SRVConfig.botServiceProtocol || 'https'}://${SRVConfig.botServiceHost}/DBF/API/${SRVConfig.botServiceVersion || '1.0.0.0'}/UserByEmail/${psid}`; // https://<host>/DBF/API/1.0.0.0/UserByEmail/<email>

  return new Promise((resolve, reject) => {
    request({
      method: "GET",
      url: SRVUrl,
      headers: {
        authorization: `bearer ${SRVConfig.accessToken}`,
        companyinfo: `${tenant}:${company}`
      }
    }, (err, response, body) => {
      if (err) { reject(err); }
      else {
        if (response && response.statusCode === 200) {
          try { 
            resolve((JSON.parse(body)).Result); 
          } catch(ex) {
            reject(ex);
          }
        }else {
          reject(new Error(`Error getting while retrieving chat user.`));
        }
      }
    });
  });
}

const checkBotUserSession = (psid, pageid, botid, tenant, company) => {

  if (!psid || !pageid || !botid || !tenant || !company)
    return Promise.reject("BotUserManager::checkBotUserSession - Invalid method parameters.");

  let chat_user_key = `botuser:${psid}:${pageid}:${botid}`;

  return new Promise((resolve, reject) => {
    // check user session in redis
    redis.GetSession(chat_user_key).then((session) => {
      if (session !== null) {
        // bot user session found in redis
        resolve(session);
      } else {
        // bot user session not found in redis
        // check user against database
        getBotUserByPSID(psid, tenant, company).then((user) => {
          if (user) {
            // bot user found in database
            // then create session in redis with bot user details
            redis.SetSession(chat_user_key, user).then((user) => {
              // session created.
              resolve(user); 
            });
          }
          else {
            // bot user not found in database
            // get bot details using botId
            // coz page access token that bind with bot object need to 
            // fetch users profile details
            BotService.GetBotById(company, tenant, botid).then((bot) => {
              if (bot && bot.IsSuccess && bot.Result) {
                let botInfo = bot.Result;
                // fetch chat user profile details
                fb.GetProfileByPSID(psid, botInfo.channel_facebook.page_token).then((profile) => {
                  if (profile) {
                    let botUser = getBotUserStruct(profile.name, null, psid, botid);
                    createBotUser(botUser, tenant, company).then((user) => {
                      if (user) {
                        redis.SetSession(chat_user_key, user).then((user) => {
                          // session created.
                          resolve(user); 
                        });
                      }
                    }, (err) => {
                      console.log(err);
                    });
                  }
                }, (err) => {
                  console.log(err);
                });
              }else {
                console.log(bot);
              }
            })
          }
        }, (err) => {
          // user profile not found in database
        })
      }
    }, (err) => {
      // something wrong with redis server
    });
  });

  // console.log(value)
}

module.exports = {
  createBotUser,
  getBotUserByPSID,
  checkBotUserSession
}