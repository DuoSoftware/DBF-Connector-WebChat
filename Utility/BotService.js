const validator = require('validator');
const config = require('config');
const Promise = require("bluebird");
const request = require("request");
const Bot = require('dbf-dbmodels/Models/Bot').Bot;
const ChannelService = require('./ChannelService');

let GetBotById = function(company, tenant,bid){

    return new Promise(function(resolve, reject) {
        if((config.Services && config.Services.botServiceHost && config.Services.botServicePort && config.Services.botServiceVersion)) {

            var dispatchURL = `${config.Services.botServiceProtocol}://${config.Services.botServiceHost}/DBF/API/${config.Services.botServiceVersion}/BotService/Bot/${bid}`;
            if (validator.isIP(config.Services.botServiceHost))
                dispatchURL = `${config.Services.botServiceProtocol}://${config.Services.botServiceHost}:${config.Services.botServicePort}/DBF/API/${config.Services.botServiceVersion}/BotService/Bot/${bid}`;

            request({
                method: "GET",
                url: dispatchURL,
                headers: {
                    authorization: "bearer "+config.Services.accessToken,
                    companyinfo: `${tenant}:${company}`
                }

            }, function (_error, _response, datax) {

                try {

                    if (!_error && _response && _response.statusCode == 200&& _response.body) {

                        var response = JSON.parse(_response.body);
                        if (response.IsSuccess) {
                            resolve(response);
                        } else {
                            reject(new Error(response.CustomMessage || "Failed to retrieve bot data"));
                        }

                    }else{

                        let error =  new Error(`There is an error in get bot`);
                        reject(error);
                    }
                }
                catch (excep) {

                    reject(excep);
                }
            });
        }else{

            reject(new Error("Service is not configured properly "));
        }

    });
};

let GetBotAppsById  = function(company, tenant,bid){

    ///DBF/API/:version/BotService/BotAppByBotId/:bid
    return new Promise(function(resolve, reject) {
        if((config.Services && config.Services.botServiceHost && config.Services.botServicePort && config.Services.botServiceVersion)) {

            var dispatchURL = `${config.Services.botServiceProtocol}://${config.Services.botServiceHost}/DBF/API/${config.Services.botServiceVersion}/BotService/BotAppByBotId/${bid}`;
            if (validator.isIP(config.Services.botServiceHost))
                dispatchURL = `${config.Services.botServiceProtocol}://${config.Services.botServiceHost}:${config.Services.botServicePort}/DBF/API/${config.Services.botServiceVersion}/BotService/BotAppByBotId/${bid}`;

            request({
                method: "GET",
                url: dispatchURL,
                headers: {
                    authorization: "bearer "+config.Services.accessToken,
                    companyinfo: `${tenant}:${company}`
                }

            }, function (_error, _response, datax) {

                try {

                    if (!_error && _response && _response.statusCode == 200&& _response.body) {

                        resolve( JSON.parse(_response.body));

                    }else{

                        let error =  new Error(`There is an error in get bot`);
                        reject(error);
                    }
                }
                catch (excep) {

                    reject(excep);
                }
            });
        }else{

            reject(new Error("Service is not configured properly "));
        }

    });
};

let GetBotByPageId = function (pageId) {
    
    if (!pageId) return Promise.reject("Invalid page id.");
    
    return new Promise((resolve, reject) => {
        Bot.find({"channel_facebook.page_id": pageId},function (err, bot) {
            if(err) { reject(err); }
            if(bot && bot.length) { resolve(bot[0]); }
            else {
                ChannelService.GetBotChannelByPageId(pageId).then((channel) => {
                    if (channel) {
                        Bot.find({"_id": channel.botID},function (err, bot) {
                            if(err) { reject(err); }
                            if(bot && bot.length) { resolve(bot[0]); }
                            else { resolve(null) }
                        });
                    } else {
                        resolve(null);
                    } 
                }).catch((err) => {
                    reject(err);
                });
            }
        });
    });

};

let GetBotFull = function(company, tenant,bid) {

    return new Promise(function(resolve, reject){
        GetBotById(company,tenant,bid).then(function(bot) {

            GetBotAppsById(company, tenant, bid).then(function (apps) {
                let data = {};
                data.bot = bot.Result;
                data.apps = apps.Result;
                resolve(data)
            }).catch(function (err) {
                reject(err);
            })
        }).catch(function (err) {
            reject(err);
        })
    });
};


let GetBotByIdFromChannel = function(company, tenant, type,bid){

    return new Promise(function(resolve, reject) {

        var dispatchURL = `${config.Services.botServiceProtocol}://${config.Services.botServiceHost}/DBF/API/${config.Services.botServiceVersion}/Channels/botandtype/${type}/${bid}`;

        request({
            method: "GET",
            url: dispatchURL,
            headers: {
                authorization: "bearer " + config.Services.accessToken,
                companyinfo: `${tenant}:${company}`
            }

        }, function (_error, _response, datax) {

            try {

                if (!_error && _response && _response.statusCode == 200 && _response.body) {

                    resolve(JSON.parse(_response.body));

                } else {

                    let error = new Error(`There is an error in get bot`);
                    reject(error);
                }
            } catch (excep) {

                reject(excep);
            }
        });

    });



};

module.exports = {
    GetBotById,
    GetBotByPageId,
    GetBotByIdFromChannel,
    GetBotAppsById,
    GetBotFull
};