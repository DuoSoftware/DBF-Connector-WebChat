const SendMessenger = require('./MessegeSender');
const request = require('request');
const config = require('config');
const Payload = require('../Common/Payload');
var validator = require('validator');
var format = require("stringformat");
const logger = require('dvp-common-lite/LogHandler/CommonLogHandler.js').logger;
var dispatcher = require('../Utility/Dispatcher');
var BotService = require('../Utility/BotService');
var BotUserManager = require('../Utility/BotUserManager');

const GetEventType = (event) => {
    var retType;
    if (event.message.type) {
        retType = event.message.type;
    } else {
        retType = "text";
    }
    return retType;
};

const GetEventData = (event) => {
    var eventData;
    if (event.message.type) {
        switch (event.message.type) {
            case "location":
                eventData = event.message.data;
                break;
            case "postback":
                eventData = event.message.data;
                break;
            default:
                //for now.. later might be changed
                eventData = event.message.data;
                break;
        }
    } else {
        eventData = event.message.text;
    }
    return eventData;
};

const Validate = function (req, res, next) {
    let botid = req.params.bid;
    let tenant = req.params.tenant;
    let company = req.params.company;

    BotService.GetBotById(company,tenant,botid).then(function(bot) {
        if (req.query['hub.mode'] && req.query['hub.verify_token'] == bot.Result.channel_facebook.verification_token) {
            let challenge = req.query['hub.challenge'];
            console.log(challenge)
            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            res.write(challenge);
            res.end();
        } else {
            res.send(403);
        }
    }).catch(function (err) {
        res.send(403);
    })
};

const ValidateInQuickBotMode = function (req, res) {
    // Parse the query params
    let mode = req.query['hub.mode'],
        token = req.query['hub.verify_token'],
        challenge = req.query['hub.challenge'];
    
    const VERIFY_TOKEN = config.Facebook.appVerifyToken; 

    if (mode && token) { 
        if (mode === 'subscribe' && token === VERIFY_TOKEN) { 
            // Responds with the challenge token from the request
            console.log('webhook verified.');
            res.end(challenge);
        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.send(403);
        } 
    } else {
        res.send(403);
    }
};

const HandleMessage = function (req, res) {

    //commenting this line since we are getting message did read lines as well
    //console.log("---------------------------------------------------");
    //console.log(JSON.stringify(req.body));
    //console.log("---------------------------------------------------");

    const company = req.params.company;
    const tenant = req.params.tenant;

    if (req.body.object === 'page') {
        // req.params.pagetoken
        BotUserManager.checkBotUserSession(
            req.body.entry[0].messaging[0].sender.id,
            req.body.entry[0].messaging[0].recipient.id,
            req.params.bid, tenant, company
        );

        req.body.entry.forEach((entry) => {
            entry.messaging.forEach((event) => {

                if (event.postback) {
                    console.log("Incoming payload event : " + new Date().toLocaleString());
                    console.log(JSON.stringify(event.postback) + "\n");
                    //redirect to message system.
                    event.message = {type: "postback", data: event.postback.payload};
                }

                if (event.message) {
                    console.log("Incoming Message : " + new Date().toLocaleString());
                    console.log(JSON.stringify(req.body));

                    if (event.message.attachments) {
                        //got attachments incoming.. may be a picture, video, file or a location
                        //for (var x = 0; x < event.message.attachments.length; x++) {
                        event.message.attachments.forEach((attachment) => {
                            //let attachment = event.message.attachments[x];
                            switch (attachment.type) {
                                case "location":
                                    /*event.message = {type: "location",
                                        data: { title: attachment.title,
                                        url : attachment.url,
                                        coordinates: attachment.payload.coordinates
                                        }
                                    }*/
                                    event.message.type = "location";
                                    event.message.data = `location-name:${attachment.title}-lat-${attachment.payload.coordinates.lat}-long-${attachment.payload.coordinates.long}`;
                                    break;
                                default:
                                    console.log("Attachment type not supported!");
                                    break;
                            }
                        });
                    }

                    if (event.message.quick_reply){
                        event.message.text = event.message.quick_reply.payload;
                    }


                    //Create payload for dispatcher
                    let payload = Payload.Payload();
                    payload.direction = "in";
                    payload.platform = "facebook";
                    payload.engagement = "facebook-chat";
                    payload.bid = req.params.bid;
                    payload.from.id = event.sender.id;
                    payload.to.id = event.recipient.id;
                    payload.message.type = GetEventType(event);
                    payload.message.data = GetEventData(event);

                    console.log("Payload to Dispatcher : ");
                    console.log(JSON.stringify(payload));

                    dispatcher.InvokeDispatch(company, tenant, payload).then(function (data) {
                        console.log("Payload from Dispatcher : ");
                        console.log(JSON.stringify(data));
                        send(data);

                    }).catch(function (error) {
                        console.log(error);
                    });

                    // if (payload.message && payload.message.data) {
                    //
                    //     request({
                    //         method: "POST",
                    //         url: "http://localhost:3638/DBF/API/1.0.0.0/Dispatcher/Invoke",
                    //         json: payload
                    //     }, function (_error, _response, datax) {
                    //
                    //         SendMessenger.SendTyping(payload, false);
                    //
                    //
                    //
                    //
                    //         //SendMessage(datax);
                    //     });
                    // }
                } else {
                    //currently ignore any other msg types such as read, delivered....
                    //add code later if needed for those callbacks
                    //console.log("Other Event : ");
                    //console.log(JSON.stringify(req.body));
                }
            });
        });
        res.send(200);
    } else {
        // console.log("Weird Event : ");
        // console.log(JSON.stringify(req.body));
    }


};

const send = async (data) => {
    if (data && data.message && data.message.outmessage) {
        if (!Array.isArray(data.message.outmessage)){
            let temp = data.message.outmessage;
            data.message.outmessage = [];
            data.message.outmessage[0] = temp;
        }

        for (var value of data.message.outmessage) {
            let newData = data;
            newData.message.outmessage = {};
            newData.message.outmessage = value;

            switch (newData.message.outmessage.type) {
                case "action":
                    await SendMessenger.SendAction(newData);
                    break;
                case  "text" :
                    await SendMessenger.SendMessage(newData);
                    break;
                case "attachment":
                    await SendMessenger.SendAttachment(newData);
                    break;
                case "quickreply":
                    await SendMessenger.SendQuickReply(newData);
                    break;
                case "card":
                    await SendMessenger.SendCard(newData);
                    break;
                case "button":
                    await SendMessenger.SendButton(newData);
                    break;
                case "media":
                    SendMessenger.SendMedia(newData);
                    break;
                case "reciept":
                    SendMessenger.SendReciept(newData);
                    break
                default:
                    data.message.outmessage.type = "text";
                    data.message.outmessage.message = "TypeError!"
                    await SendMessenger.SendMessage(data);
                    break;

            }
        }
        console.log("Request completed. \n");
    } else {
        console.log("There is no out message found ");
    }
}

const HandleMessageInQuickBotMode = function (req, res) {

    let body = req.body;

    if (body.object === 'page') { 
        body.entry.forEach((entry) => {
            BotService.GetBotByPageId(entry.id).then((bot) => {
                if (bot) {
                    req.params['company'] = bot.company;
                    req.params['tenant'] = bot.tenant;
                    req.params['bid'] = bot._id;
                    HandleMessage(req, res);
                }else {
                    res.send(403);
                }
            }).catch((err) => {
                res.send(403);
            });
        });
    }
};

const HandleCallback = function (req, res) {

    const company = req.params.company;
    const tenant = req.params.tenant;
    const botid = req.params.bid;
    var data = req.body;

    if (data && data.message && data.message.outmessage) {
        if (!Array.isArray(data.message.outmessage)){
            let temp = data.message.outmessage;
            data.message.outmessage = [];
            data.message.outmessage[0] = temp;
        }

        for (var value of data.message.outmessage) {
            let newData = data;
            data.message.outmessage = {};
            newData.message.outmessage = value;

            switch (data.message.outmessage.type) {
                case "action":
                    SendMessenger.SendAction(newData);
                    break;
                case  "text" :
                    SendMessenger.SendMessage(newData);
                    break;
                case "attachment":
                    SendMessenger.SendAttachment(newData);
                    break;
                case "quickreply":
                    SendMessenger.SendQuickReply(newData);
                    break;
                case "card":
                    SendMessenger.SendCard(newData);
                    break;
                case "button":
                    SendMessenger.SendButton(newData);
                    break;
                case "media":
                    SendMessenger.SendMedia(newData);
                    break;
                case "receipt":
                    SendMessenger.SendReciept(newData);
                    break;
                default:
                    data.message.outmessage.type = "text";
                    data.message.outmessage.message = "TypeError!"
                    SendMessenger.SendMessage(data);
                    res.send({Status:false, Message:"Unknown message type."}); return;
                    break;

            }
        }
        console.log("Request completed. \n");
        res.send({Status:true, Message:"Request completed."}); return;
    } else {
        console.log("There is no out message found ");
        res.send({Status:false, Message:"No out message found."}); return;
    }

};

module.exports = {
    Validate,
    ValidateInQuickBotMode,
    HandleMessage,
    HandleMessageInQuickBotMode,
    HandleCallback
}