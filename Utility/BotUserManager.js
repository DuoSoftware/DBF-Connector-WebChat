const request = require("request"),
  config = require('config'),
  redisManager = require('./RedisManager'),
  fb = require('./FacebookService'),
  BotService = require('./BotService');

let redis = new redisManager();

const getBotUserStruct = (psid, bot_id, desc) => {
  if (psid && bot_id) {
    return {
      userID: psid,
      bot: bot_id,
      email: psid,
      roles: [],
      groups: [],
      description: desc || "This a bot user",
      enable: true,
      botUser: true,
    }
  }
}

const createBotUser = (user, tenant, company) => {

  console.log("\n=============== Entered createBotUser ===============\n");

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
      console.log(err);
      console.log(response);
      console.log(body);
      if (err) {
        reject(err);
      }
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

  console.log("\n=============== Entered getBotUserByPSID ===============\n");

  if (!config.Services || !config.Services.botServiceHost) {
    return Promise.reject("Required environment variables not provided.('Services')");
  }

  if (!psid || !company || !tenant) {
    return Promise.reject("BotUserManager::getBotUserByPSID - Invalid method parameters.");
  }

  const SRVConfig = config.Services;
  let SRVUrl = `${SRVConfig.botServiceProtocol || 'https'}://${SRVConfig.botServiceHost}/DBF/API/${SRVConfig.botServiceVersion || '1.0.0.0'}/UserByEmail/${psid}`; // https://<host>/DBF/API/1.0.0.0/UserByEmail/<email>

  return new Promise((resolve, reject) => {
    request({
      method: "GET",
      url: SRVUrl,
      headers: {
        authorization: `bearer ${SRVConfig.accessToken}`,
        companyinfo: `${tenant}:${company}`
      }
    }, (err, response, body) => {
      if (err) {
        reject(err);
      } else {
        if (response && response.statusCode === 200) {
          try {
            resolve((JSON.parse(body)).Result);
          } catch (ex) {
            reject(ex);
          }
        } else {
          reject(new Error(`Error getting while retrieving chat user.`));
        }
      }
    });
  });
}

const checkBotUserSession = (psid, pageid, botid, tenant, company) => {
  console.log("\n=============== Entered checkBotUserSession ===============");

  if (!psid || !pageid || !botid || !tenant || !company) {
    return Promise.reject("BotUserManager::checkBotUserSession - Invalid method parameters.");
  }

  let chat_user_key = `botuser:${psid}:${pageid}:${botid}`;
  console.log("chat_user_key: " + chat_user_key);

  return new Promise((resolve, reject) => {

    // check user session in redis
    redis.GetSession(chat_user_key).then(function (session) {
      console.log("\n========= Session details =========");
      console.log(JSON.stringify(session));

      if (session !== null) {
        // bot user session found in redis
        resolve(session);
      } else {
        // bot user session not found in redis
        // check user against database
        getBotUserByPSID(psid, tenant, company).then(function (user) {

          console.log("\n========= User data received from getBotUserByPSID =========");
          console.log(JSON.stringify(user));

          if (user) {
            // bot user found in database
            // then create session in redis with bot user details
            redis.SetSession(chat_user_key, user).then(function (user) {
              resolve(user);
            }).catch(function (error) {
              console.log("Error occurred in redis SetSession: " + error);
            });

          } else {
            // bot user not found in database
            // get bot details using botId
            // coz page access token that bind with bot object need to 
            // fetch users profile details


            ////// Create bot user in DB and create a session

            // BotService.GetBotById(company, tenant, botid).then(function (bot) {

            // }).catch(function (error) {
            //   console.log("Error occurred in GetBotById: " + error);
            // });

            // let botUser = getBotUserStruct(psid, botid);
            // console.log(botUser);

            // createBotUser(botUser, tenant, company).then(function (user) {
            //   console.log(user);
            //   if (user) {
            //     redis.SetSession(chat_user_key, user).then(function (user) {
            //       // session created.
            //       // console.log(user);
            //       resolve(user);
            //     }).catch(function (error) {
            //       console.log("Error occurred in redis SetSession: " + error);
            //     });
            //   }
            // }).catch(function (error) {
            //   console.log("Error occurred in createBotUser: " + error);
            // });

            ////// Create a session without creating a bot user in DB
            let botUser = getBotUserStruct(psid, botid);

            console.log("\nbotUser: " + botUser);

            redis.SetSession(chat_user_key, botUser).then(function (botUser) {
              resolve(botUser);
            }).catch(function (error) {
              console.log("Error occurred in redis SetSession: " + error);
            });
          }
        }).catch(function (error) {
          console.log("Error occurred in getBotUserByPSID: " + error);
        });
      }
    }).catch(function (error) {
      console.log("Error occurred in redis get session: " + error);
    });
  });
}

module.exports = {
  createBotUser,
  getBotUserByPSID,
  checkBotUserSession
}
