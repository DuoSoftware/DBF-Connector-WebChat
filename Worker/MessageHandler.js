const request = require('request');
const config = require('config');
const Payload = require('../Common/Payload');
const translate = require('dbf-speechtotext/Worker/translate').Translate;
const detectLanguage = require('dbf-speechtotext/Worker/translate').DetectLanguage;
const Bot = require('dbf-dbmodels/Models/Bot').Bot;
const Channel = require('dbf-dbmodels/Models/Channels').channel;
const messageFormatter = require('dvp-common-lite/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var validator = require('validator');
var format = require("stringformat");
var dispatcher = require('../Utility/Dispatcher');
var BotService = require('../Utility/BotService');
var BotUserManager = require('../Utility/BotUserManager');
// var ChannelService = require('../Utility/ChannelService');
var redisManager = require('../Utility/RedisManager');
var restify = require('restify');
var xml = require('xml');
let redis = new redisManager();

const Test = async function (req, res) {

    console.log("\n=====================================================================");
    console.log("======== Entered Test method of WebChat connector ========");
    res.end("Test")
}

const IncomingMessage = async function (req, res) {

    console.log("\n=====================================================================");
    console.log("======== Entered MessageReceive method of WebChat connector ========");

    console.log(req);
    console.log("================================");
    console.log(req.body);

    let senderID = req.body.messaging.sender.id;

    res.end('{"messaging_type":"RESPONSE","recipient":{"id":"' + senderID + '"},"message":{"text":"Message received"}}')
}

const IncomingMessageTest = async function (req, res) {

    console.log("\n=====================================================================");
    console.log("======== Entered MessageReceive method of WebChat connector ========");

    console.log(req);
    console.log("================================");
    console.log(req.body);

    //     body:Object {SmsMessageSid: "SMa3d0cf78426ca6b1c9044fa05857c7a9", NumMedia: "0", SmsSid: "SMa3d0cf78426ca6b1c9044fa05857c7a9", …}
    // AccountSid:""
    // ApiVersion:"2010-04-01"
    // Body:"Hi"
    // From:"whatsapp:+94771563283"
    // MessageSid:"SMa3d0cf78426ca6b1c9044fa05857c7a9"
    // NumMedia:"0"
    // NumSegments:"1"
    // SmsMessageSid:"SMa3d0cf78426ca6b1c9044fa05857c7a9"
    // SmsSid:"SMa3d0cf78426ca6b1c9044fa05857c7a9"
    // SmsStatus:"received"
    // To:"whatsapp:+14155238886"

    // console.log(JSON.parse(req.body));


    // {
    //     "AccountSid":"",
    //     "ApiVersion":"2010-04-01",
    //     "Body":"Can I book a taxi?",
    //     "From":"whatsapp:+94771563283",
    //     "MessageSid":"SMa3d0cf78426ca6b1c9044fa05857c7a9",
    //     "NumMedia":"0",
    //     "NumSegments":"1",
    //     "SmsMessageSid":"SMa3d0cf78426ca6b1c9044fa05857c7a9",
    //     "SmsSid":"SMa3d0cf78426ca6b1c9044fa05857c7a9",
    //     "SmsStatus":"received",
    //     "To":"whatsapp:+14155238886"
    // }

    let whatsAppTwilioData = Payload.WhatsAppTwilioData();

    whatsAppTwilioData.accountSid = req.body.AccountSid;
    whatsAppTwilioData.apiVersion = req.body.ApiVersion;
    whatsAppTwilioData.audienceNumber = req.body.From;
    whatsAppTwilioData.body = req.body.Body;
    whatsAppTwilioData.botNumber = req.body.To;
    whatsAppTwilioData.messageSid = req.body.MessageSid;
    whatsAppTwilioData.numMedia = req.body.NumMedia;
    whatsAppTwilioData.numSegments = req.body.NumSegments;
    whatsAppTwilioData.smsMessageSid = req.body.SmsMessageSid;
    whatsAppTwilioData.smsSid = req.body.SmsSid;
    whatsAppTwilioData.smsStatus = req.body.SmsStatus;

    await GetChannelDetailsFromRedis(whatsAppTwilioData.accountSid, "whatsapp", whatsAppTwilioData.botNumber)
        .then(function (channelData) {

            let botID = channelData.botID;
            // let companyID = channelData.company;
            let companyID = "246";
            // let tenantID = channelData.tenant;
            let tenantID = "223";
            let accountSid = channelData.channelWhatsApp.accountSid;
            let authToken = channelData.channelWhatsApp.authToken;

            let payload = Payload.Payload();
            payload.direction = "in";
            payload.platform = "whatsapp";
            payload.engagement = "whatsapp-chat";
            payload.bid = botID;
            //payload.from.id = whatsAppTwilioData.audienceNumber;
            payload.from.id = whatsAppTwilioData.audienceNumber.replace('whatsapp:+', '');
            //payload.to.id = whatsAppTwilioData.botNumber;    
            payload.to.id = whatsAppTwilioData.botNumber.replace('whatsapp:+', '');
            payload.message.type = "text";
            payload.message.data = whatsAppTwilioData.body;

            console.log("\n======== Original text ========");
            console.log(whatsAppTwilioData.body);

            let language = "en";

            detectLanguage(config.Google.translate, whatsAppTwilioData.body).then(function (languageData) {

                console.log(languageData);
                decodedLanguageData = JSON.parse(languageData);

                console.log("\n======== Original language ========");
                console.log(decodedLanguageData.Result.language);
                language = decodedLanguageData.Result.language;

                translate(config.Google.translate, whatsAppTwilioData.body, "en").then(function (translateData) {

                    console.log(translateData);
                    decodedTranslateData = JSON.parse(translateData);

                    console.log("\n======== Translated text ========");
                    console.log(decodedTranslateData.Result.translatedText);
                    payload.message.data = decodedTranslateData.Result.translatedText;

                    /// THE CODE/////////////////////

                    console.log("\n========Payload to Dispatcher ========");
                    console.log(JSON.stringify(payload));
                    console.log("================================================\n");

                    let finalTextOutput = "";

                    dispatcher.InvokeDispatch(companyID, tenantID, payload).then(function (data) {
                        console.log("\n======== Payload from Dispatcher ========");
                        console.log(JSON.stringify(data));
                        console.log("================================================\n");

                        if (data && data.message && data.message.outmessage) {
                            if (!Array.isArray(data.message.outmessage)) {
                                let temp = data.message.outmessage;
                                data.message.outmessage = [];
                                data.message.outmessage[0] = temp;
                            }
                            for (var value of data.message.outmessage) {
                                // console.log(value);
                                let newData = data;
                                newData.message.outmessage = {};
                                newData.message.outmessage = value;

                                if (newData.message.outmessage.type == "text") {
                                    let textOutput = newData.message.outmessage.message;
                                    if (finalTextOutput == "") {
                                        finalTextOutput = textOutput;
                                    } else {
                                        finalTextOutput = finalTextOutput + ",  " + textOutput;
                                    }
                                }
                            }

                            console.log("\n======== Final text output ========");
                            console.log(finalTextOutput);

                            const client = require('twilio')(accountSid, authToken);

                            translate(config.Google.translate, finalTextOutput, language).then(function (translatedData2) {

                                console.log("\n======== Translated Data from translator ========");
                                console.log(translatedData2);
                                decodedTranslateData2 = JSON.parse(translatedData2);

                                console.log("\n======== Data to send message ========");
                                console.log("Translated final text output: " + decodedTranslateData2.Result.translatedText);
                                console.log("BotNumber: " + whatsAppTwilioData.botNumber);
                                console.log("AudienceNumber: " + whatsAppTwilioData.audienceNumber);

                                client.messages
                                    .create({
                                        body: decodedTranslateData2.Result.translatedText,
                                        from: whatsAppTwilioData.botNumber,
                                        to: whatsAppTwilioData.audienceNumber
                                    })
                                    .then((message) => {
                                        console.log("Message sid received from twilio: " + message.sid);
                                        console.log("Request completed \n");
                                    })
                                    // .then(message => console.log(message.sid))
                                    .done();
                            });

                            // console.log("Request completed. \n");

                            res.writeHead(200, {
                                "Content-Type": "application/xml"
                            });
                            res.end();
                        };
                    }).catch(function (excep) {
                        console.log("\n======== Exception thrown from InvokeDispatch ========");
                        console.log(excep);
                    });
                    /////////////////////////////////
                });
            });
        })
        .catch(function (error) {
            console.log("\n======== Exception thrown from GetChannelDetailsFromRedis ========");
            console.log(error);
        })
};

function sendMessage(fromNumber, toNumber, message, accountSid, authToken) {

    // let data = getDataFromRedis(fromNumber);

    // const accountSid = '';
    // const authToken = '';
    // const accountSid = data.accountSid;
    // const authToken = data.authToken;
    const client = require('twilio')(accountSid, authToken);

    client.messages
        .create({
            body: message,
            from: fromNumber,
            to: toNumber
        })
        .then(message => console.log(message.sid))
        .done();
}

function getDataFromRedis(whatsAppNumber) {
    console.log("Entered getDataFromRedis. whatsAppNumber: " + whatsAppNumber);
    return new Promise((resolve, reject) => {

        if (!whatsAppNumber) {
            reject("getDataFromRedis - Invalid method parameters.");
        }

        let key = "whatsAppNumber:" + whatsAppNumber;
        console.log("key: " + key);

        let redis = new redisManager();

        redis.GetSession(key).then((data) => {
            console.log(data);
            if (data == null) {
                saveDataInRedis(whatsAppNumber).then((dataFromDB) => {
                    resolve(dataFromDB);
                }).catch(function (err) {
                    reject(err);
                });
            } else {
                console.log("data: " + data);
                resolve(data);
            }
        }, (err) => {
            reject(err);
        });
    });

    // console.log(value)
}

function saveDataInRedis(whatsAppNumber) {
    console.log("Entered saveDataInRedis. whatsAppNumber: " + whatsAppNumber);
    return new Promise((resolve, reject) => {

        if (!whatsAppNumber) {
            reject("saveDataInRedis - Invalid method parameters.");
        }

        let dataFromDB = getBotDataFromDB(whatsAppNumber);

        let key = "whatsAppNumber:" + whatsAppNumber;
        console.log("key: " + key);

        // check user session in redis
        let redis = new redisManager();

        redis.SetSession(key, dataFromDB).then((dataFromDB) => {
            // session created.
            resolve(dataFromDB);
        }).catch(function (err) {
            reject(err);
        })
    });
    // console.log(value)
}


function getBotDataFromDB(whatsAppNumber) {

    console.log("getBotDataFromDB Internal method ");

    Bot.findOne({
        whatsAppNumber: whatsAppNumber
    }, function (err, _bot) {
        if (err) {
            return null;
        } else {
            return _bot;
        }
    });
}

const messageSend = function (req, res) {

    const accountSid = '';
    const authToken = '';
    const client = require('twilio')(accountSid, authToken);

    client.messages
        .create({
            body: 'Hello there!',
            from: 'whatsapp:+14155238886',
            to: 'whatsapp:+94771563283'
        })
        .then(message => console.log(message.sid))
        .done();
};


let GetChannelDetailsFromRedis = (accountSid, type, fromID) => {
    return new Promise((resolve, reject) => {
        console.log("\n=============== Entered GetChannelDetailsFromRedis ===============");

        // Removing 'whatsapp:' from the number that gets sent from twilio
        fromID = fromID.replace('whatsapp:', '');
        let jsonString;

        if (fromID === undefined || fromID === "") {
            console.log("From ID is empty. Please enter a from ID");
            jsonString = messageFormatter.FormatMessage(undefined, "From ID is empty. Please enter a from ID", false, undefined);
            reject(jsonString);
        }

        let channel_key = "channel:" + type + ":" + accountSid + ":" + fromID;
        console.log("channel_key: " + channel_key);

        // check user session in redis
        redis.GetSession(channel_key)
            .then(function (session) {
                console.log("\n========= Session details =========");
                console.log(JSON.stringify(session));

                if (session !== null) {
                    // channel session found in redis
                    resolve(session);
                } else {
                    // channel session not found in redis
                    // check channel details database
                    GetChannelDetails(accountSid, type, fromID)
                        .then(function (channel) {

                            console.log("\n========= Channel data received from GetChannelDetails =========");
                            console.log(JSON.stringify(channel));

                            if (channel) {
                                // channel data found in database
                                // then create session in redis with channel details
                                redis.SetSession(channel_key, channel)
                                    .then(function (channel) {
                                        resolve(channel);
                                    })
                                    .catch(function (error) {
                                        console.log("Error occurred in redis SetSession: " + error);
                                        jsonString = messageFormatter.FormatMessage(error, "Error occurred in redis SetSession", false, undefined);
                                        reject(jsonString);
                                    });
                            } else {
                                console.log("No channel details found for the given from ID");
                                jsonString = messageFormatter.FormatMessage(undefined, "No channel details found for the given from ID", false, undefined);
                                reject(jsonString);
                            }
                        })
                        .catch(function (error) {
                            console.log("\n========= Error occurred in GetChannelDetails =========");
                            console.log(error);
                            jsonString = messageFormatter.FormatMessage(error, "Error occurred in GetChannelDetails", false, undefined);
                            reject(jsonString);
                        });
                }
            })
            .catch(function (error) {
                console.log("\n========= Error occurred in redis GetSession =========");
                console.log(error);
                jsonString = messageFormatter.FormatMessage(error, "Error occurred in redis GetSession", false, undefined);
                reject(jsonString);
            });
    });
}

let GetChannelDetails = (accountSid, type, fromID) => {
    return new Promise((resolve, reject) => {
        console.log("\n==================== GetChannelDetails function ====================");

        let jsonString;

        if (fromID === undefined || fromID === "") {
            console.log("From ID is empty. Please enter a from ID");
            jsonString = messageFormatter.FormatMessage(undefined, "From ID is empty. Please enter a from ID", false, undefined);
            reject(jsonString);
        }

        Channel.findOne({ fromID: fromID, type: type, "channelWhatsApp.accountSid": accountSid }, function (err, _channel) {
            if (err) {
                console.log("Retrieve channel data by from ID has failed. Error: " + err);
                jsonString = messageFormatter.FormatMessage(err, "Retrieve channel data by from ID has failed", false, undefined);
                reject(jsonString);
            } else {
                resolve(_channel);
            }
        });
    });
}

module.exports = {
    IncomingMessage,
    Test
}
