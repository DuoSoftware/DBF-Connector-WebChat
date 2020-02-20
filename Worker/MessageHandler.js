const SendMessenger = require('./MessegeSender');
const config = require('config');
const Payload = require('../Common/Payload');
var dispatcher = require('../Utility/Dispatcher');
var BotService = require('../Utility/BotService');
var redisManager = require('../Utility/RedisManager');
let redis = new redisManager();
const messageFormatter = require('dvp-common-lite/CommonMessageGenerator/ClientMessageJsonFormatter.js');
// const Bot = require('dbf-dbmodels/Models/Bot').Bot;
const Channel = require('dbf-dbmodels/Models/Channels').channel;
var Client = require('node-rest-client').Client;

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

    BotService.GetBotById(company, tenant, botid).then(function (bot) {
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
        // Responds with '403 Forbidden' if verify tokens do not match
        res.send(403);
    }
};

const HandleMessage = function (req, res) {

    //commenting this line since we are getting message did read lines as well
    console.log("---------------------------------------------------");
    console.log(JSON.stringify(req.body));
    console.log("---------------------------------------------------");

    const company = req.params.company;
    const tenant = req.params.tenant;

    // if (req.body.object === 'page') {
    // req.params.pagetoken

    // req.body.entry.forEach((entry) => {
    req.body.messaging.forEach(async function (event) {

        if (event.postback) {
            console.log("Incoming payload event : " + new Date().toLocaleString());
            console.log(JSON.stringify(event.postback) + "\n");
            //redirect to message system.
            event.message = {
                type: "postback",
                data: event.postback.payload
            };
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

            if (event.message.quick_reply) {
                event.message.text = event.message.quick_reply.payload;
            }

            // TODO getting data from channels
            // await GetChannelDetailsFromRedis(whatsAppTwilioData.accountSid, "webchat", whatsAppTwilioData.botNumber)
            // await GetChannelDetailsFromRedis("368294987165077", "facebook", "368294987165077")
            //   .then(async function (channelData) {
            //     console.log(channelData);

            //           { direction: 'in',
            //   bid: '5d036f9ab2e7161945e07647',
            //   platform: 'facebook',
            //   engagement: 'facebook-chat',
            //   from: { id: '2291570924231124', raw: {} },
            //   to: { id: '2057280104578620', raw: {} },
            //   message: { type: 'text', data: 'cancel' } }
            // { tenant: '247', company: '703' }

            //Create payload for dispatcher
            let payload = Payload.Payload();
            payload.direction = "in";
            payload.platform = "webchat";
            payload.engagement = "webchat-chat";
            // payload.bid = channelData.botID;


            // TODO getting botID data from channels
            payload.bid = "5d19ea21767bd746317e399b";


            // TODO getting from data from webchat
            payload.from.id = event.sender.id;

            // if (payload.from.id === "") {
            payload.from.id = "senderid";

            // }


            // TODO getting to data from channels
            payload.to.id = event.recipient.id;
            // if (payload.to.id === "") {
            payload.to.id = "recipientid";

            // }

            payload.message.type = GetEventType(event);
            payload.message.data = GetEventData(event);

            console.log("Payload to Dispatcher : ");
            console.log(JSON.stringify(payload));


            // save webchat session in redis
            let webchat_session_key = "webchatsession:" + payload.bid + ":" + payload.from.id;
            let webchat_user = payload.from.id;

            redis.SetSession(webchat_session_key, webchat_user).then((webchat_user) => {
                // session created.
                // resolve(user); 
            });
            // dispatcher.InvokeDispatch(company, tenant, payload).then(function (data) {

            // TODO getting company data from channels
            await dispatcher.InvokeDispatch("749", "555", payload).then(async function (data) {

                console.log("Payload from Dispatcher : ");
                console.log(JSON.stringify(data));

                // Payload from Dispatcher : 
                // {"direction":"out","bid":"5d19ea21767bd746317e399b","platform":"webchat","engagement":"webchat-chat","from":{"id":"recipientid",
                // "raw":{}},"to":{"id":"senderid","raw":{}},"message":{"type":"postback","data":"apply_for_lease","outmessage":[{"type":"action",
                // "message":"typing_on","note":"","payload":"","index":0,"data":{"type":"DEFAULT","context":{"v_type":"hello","s_type":"Installment",
                // "id":"dbf:5d19ea21767bd746317e399b:senderid"}}},{"type":"action","message":"typing_on","note":"The Bot is typing",
                // "payload":"2","index":1,"data":{"type":"DEFAULT","context":{"v_type":"hello","s_type":"Installment",
                // "id":"dbf:5d19ea21767bd746317e399b:senderid"}}},{"type":"quickreply","message":"5d5cfc3823012a35e4bcc4b2",
                // "note":"Adding a quick reply to response.","payload":"","index":2,"data":{"type":"DEFAULT","context":{"v_type":"hello",
                // "s_type":"Installment","id":"dbf:5d19ea21767bd746317e399b:senderid"}}}]},"timestamp":"1576053549474",
                // "session":{"bot":{"ai":{"name":"default","key":"","description":""},"aws":{"accessKeyId":"n/a","secretAccessKey":"n/a",
                // "region":"n/a"},"bot_language":"en","channels":[],"client_language":"en","entities":[],"multi_language_enabled":false,
                // "speech_to_text_enabled":false,"_id":"5d19ea21767bd746317e399b","name":"Smooth Tradersc21vb3RoZmxvdy5pby0wMjdjZTc",
                // "screen_name":"Smooth Traders","description":"Smooth Traders - Chatbot created on Mon Jul 01 2019 16:40:23 GMT+0530 (India Standard Time)",
                // "status":true,"company":749,"creation_type":"basic","bot_type":"fb","tenant":555,"channel_facebook":{"_id":"5d19ea21767bd742077e399c",
                // "created_at":"2019-07-01T11:10:25.461Z","updated_at":"2019-07-01T11:10:25.461Z","company":-1,"tenant":-1,
                // "page_id":"2350758655246021","app_id":"","app_secret":"","page_token":"EAAMegfEn8iEBAPeZBAIjgPRzwwpyYL9McKXl8afVuoXfNX0lJbZB15b7X8jxhV8XXkQ3ig1ASFW6SuYMTMUIMJKj7NRLrWmsZBbnTmlqIkZCLgtlPGstySiB1L6HJJGD4MxoHyGJb833cXCAMgIHLlYhF3ueVpFnynaXCPQ7UGvCZAQPqBUS5",
                // "verification_token":"c21vb3RoZmxvdy5pby1iZmIwNjI"},"channel_slack":{"_id":"5d19ea21767bd74bc27e399d","created_at":"2019-07-01T11:10:25.462Z",
                // "updated_at":"2019-07-01T11:10:25.462Z","company":-1,"tenant":-1,"client_id":"","client_secret":"","verification_token":"",
                // "api_token":"","bot_token":""},"avatar":"11111111111111111111111111111111111111111111","created_at":"2019-07-01T11:10:25.463Z",
                // "updated_at":"2019-07-01T11:10:25.463Z","__v":0},"apps":[{"config":{"typing":true,"Securitykey":"<key>"},
                // "_id":"5d19ea22767bd78d357e399e","company":749,"tenant":555,"bot_id":"5d19ea21767bd746317e399b","app":"smoothflow",
                // "order":0,"created_at":"2019-07-01T11:10:26.579Z","updated_at":"2019-07-01T11:10:26.579Z","__v":0}],"EngagementSessionId":"b3236110-1bf1-11ea-9245-f3b60a374dda",
                // "logger":{"domain":null,"_events":{},"_eventsCount":0,"transports":{"console":{"domain":null,"_events":{},"_eventsCount":1,
                // "silent":false,"raw":false,"name":"console","level":"debug","handleExceptions":false,"exceptionsLevel":"error",
                // "humanReadableUnhandledException":false,"json":false,"colorize":true,"prettyPrint":false,"timestamp":false,"showLevel":true,
                // "label":null,"logstash":false,"depth":null,"align":false,"stderrLevels":{"error":true,"debug":true},"eol":"\n"},
                // "file":{"domain":null,"_events":{},"_eventsCount":1,"silent":false,"raw":false,"name":"file","level":"debug",
                // "handleExceptions":false,"exceptionsLevel":"error","humanReadableUnhandledException":false,"filename":"logger.log",
                // "_basename":"logger.log","dirname":".","options":{"flags":"a","highWaterMark":24},"json":true,"logstash":false,
                // "colorize":false,"maxsize":5242880,"rotationFormat":false,"zippedArchive":false,"maxFiles":10,"prettyPrint":false,
                // "label":null,"timestamp":true,"eol":"\n","tailable":false,"depth":null,"showLevel":true,"maxRetries":2,"_size":1702012,
                // "_created":0,"_buffer":[],"_draining":false,"_opening":false,"_failures":0,"_archive":null,"opening":false,
                // "_stream":{"_writableState":{"objectMode":false,"highWaterMark":24,"finalCalled":false,"needDrain":false,"ending":false,
                // "ended":false,"finished":false,"destroyed":false,"decodeStrings":true,"defaultEncoding":"utf8","length":0,"writing":false,
                // "corked":0,"sync":false,"bufferProcessing":false,"writecb":null,"writelen":0,"bufferedRequest":null,
                // "lastBufferedRequest":null,"pendingcb":0,"prefinished":false,"errorEmitted":false,"emitClose":false,"bufferedRequestCount":0,
                // "corkedRequestsFree":{"next":null,"entry":null}},"writable":true,"domain":null,"_events":{},"_eventsCount":1,
                // "_maxListeners":null,"path":"logger.log","fd":29,"flags":"a","mode":438,"autoClose":true,"bytesWritten":1702012,
                // "closed":false},"_isStreams2":true}},"_names":["console","file"],"padLevels":false,"levels":{"error":0,"warn":1,"info":2,
                // "verbose":3,"debug":4,"silly":5},"id":null,"level":"info","emitErrs":false,"stripColors":false,"exitOnError":true,
                // "exceptionHandlers":{},"profilers":{},"rewriters":[],"filters":[]},"IntegrationService":{},"context":{"v_type":"hello",
                // "s_type":"Installment","id":"dbf:5d19ea21767bd746317e399b:senderid"}}}




                let response = await Send2WebChat(data).then(function (response) {
                    console.log(response);
                    console.log(JSON.stringify(response));

                    res.end(JSON.stringify(response));
                    // res.end(`{"messaging_type":"RESPONSE","recipient":{"id":"2405577362863983"},"message":{"attachment":
                    // {"type":"template","payload":{"template_type":"generic","elements":[{"title":"PIZZA","subtitle":"",
                    // "image_url":"https://s3.amazonaws.com/botmediastorage/501/676/pzp.jpg","default_action":{"type":"web_url",
                    // "url":"https://smoothflow.io","messenger_extensions":true,"webview_height_ratio":"full","fallback_url":"https://smoothflow.io"},
                    // "buttons":[{"type":"postback","title":"Pizza Menu","payload":"pizza_menu"}]},{"title":"PASTA","subtitle":"",
                    // "image_url":"https://s3.amazonaws.com/botmediastorage/501/676/shrimp.jpg","default_action":{"type":"web_url",
                    // "url":"https://smoothflow.io","messenger_extensions":true,"webview_height_ratio":"full","fallback_url":"https://smoothflow.io"},
                    // "buttons":[{"type":"postback","title":"Pasta Menu","payload":"pasta_menu"}]},{"title":"SIDES","subtitle":"",
                    // "image_url":"https://s3.amazonaws.com/botmediastorage/501/676/potatto.jpg","default_action":{"type":"web_url",
                    // "url":"https://smoothflow.io","messenger_extensions":true,"webview_height_ratio":"full","fallback_url":"https://smoothflow.io"},
                    // "buttons":[{"type":"postback","title":"Sides Menu","payload":"sides_menu"}]},{"title":"DRINKS","subtitle":"",
                    // "image_url":"https://s3.amazonaws.com/botmediastorage/501/676/cinderella-recipe-non-alcoholic-759631-14-5b3f9c4d46e0fb00370dd350.jpg",
                    // "default_action":{"type":"web_url","url":"https://smoothflow.io","messenger_extensions":true,"webview_height_ratio":"full","fallback_url":"https://smoothflow.io"},
                    // "buttons":[{"type":"postback","title":"Drinks Menu","payload":"drinks_menu"}]}]}}}}`);
                }).catch(function (error) {
                    console.log("Error from Dispatcher : ");
                    console.log(error);
                });
            }).catch(function (error) {
                console.log("Error from Dispatcher : ");
                console.log(error);
            });
            // })
            // .catch(function (error) {
            //   console.log("\n======== Exception thrown from GetChannelDetailsFromRedis ========");
            //   console.log(error);
            //   res.send(500);
            // })


        } else {
            //currently ignore any other msg types such as read, delivered....
            //add code later if needed for those callbacks
            //console.log("Other Event : ");
            //console.log(JSON.stringify(req.body));
        }
    });
    // });
    // res.send(200);
    // } else {
    // console.log("Weird Event : ");
    // console.log(JSON.stringify(req.body));
    // }
};

Send2WebChat = function (data) {

    return new Promise(async function (resolve, reject) {

        // const Send2WebChat = async (data) => {
        if (data && data.message && data.message.outmessage) {
            if (!Array.isArray(data.message.outmessage)) {
                let temp = data.message.outmessage;
                data.message.outmessage = [];
                data.message.outmessage[0] = temp;
            }

            let responseArray = [];

            for (var value of data.message.outmessage) {
                let newData = data;
                newData.message.outmessage = {};
                newData.message.outmessage = value;

                switch (newData.message.outmessage.type) {
                    case "action":
                        message = await SendMessenger.SendAction(newData);
                        console.log("Message: " + message);
                        responseArray.push(message);
                        // resolve(message);
                        break;
                    case "attachment":
                        message = await SendMessenger.SendAttachment(newData);
                        console.log("Message: " + message);
                        responseArray.push(message);
                        // resolve(message);
                        break;
                    case "button":
                        message = await SendMessenger.SendButton(newData);
                        console.log("Message: " + message);
                        responseArray.push(message);
                        // resolve(message);
                        break;
                    case "calendar":
                        message = await SendMessenger.SendCalendar(newData);
                        console.log("Message: " + message);
                        responseArray.push(message);
                        // resolve(message);
                        break;
                    case "card":
                        message = await SendMessenger.SendCard(newData);
                        console.log("Message: " + message);
                        responseArray.push(message);
                        // resolve(message);
                        break;
                    case "general":
                        message = SendMessenger.SendGeneral(newData);
                        console.log("Message: " + message);
                        responseArray.push(message);
                    case "media":
                        message = SendMessenger.SendMedia(newData);
                        console.log("Message: " + message);
                        responseArray.push(message);
                        // resolve(message);
                        break;
                    case "quickreply":
                        message = await SendMessenger.SendQuickReply(newData);
                        console.log("Message: " + message);
                        responseArray.push(message);
                        // resolve(message);
                        break;
                    case "reciept":
                        message = SendMessenger.SendReciept(newData);
                        console.log("Message: " + message);
                        responseArray.push(message);
                        // resolve(message);
                        break;
                    case "selection":
                        message = SendMessenger.SendSelection(newData);
                        console.log("Message: " + message);
                        responseArray.push(message);
                        // resolve(message);
                        break;
                    case "text":
                        message = await SendMessenger.SendMessage(newData);
                        console.log("Message: " + message);
                        responseArray.push(message);
                        // resolve(message);
                        break;
                    default:
                        data.message.outmessage.type = "text";
                        data.message.outmessage.message = "TypeError!"
                        await SendMessenger.SendMessage(data);
                        break;

                }
            }

            resolve(responseArray);

            console.log("Request completed. \n");
        } else {
            console.log("There is no out message found ");
        }
    });
}

let GetChannelDetailsFromRedis = (accountSid, type, fromID) => {
    return new Promise((resolve, reject) => {
        console.log("\n=============== Entered GetChannelDetailsFromRedis ===============");

        // Removing 'whatsapp:' from the number that gets sent from twilio
        // fromID = fromID.replace('whatsapp:', '');
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

        //
        if (fromID === undefined || fromID === "") {
            console.log("From ID is empty. Please enter a from ID");
            jsonString = messageFormatter.FormatMessage(undefined, "From ID is empty. Please enter a from ID", false, undefined);
            reject(jsonString);
        }

        Channel.findOne({
            fromID: fromID,
            type: type
        }, function (err, _channel) {
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

const HandleMessageInQuickBotMode = function (req, res) {

    let body = req.body;

    if (body.object === 'page') {
        body.entry.forEach((entry) => {
            BotService.GetBotByPageId(entry.id).then((bot) => {
                if (bot) {
                    req.params['company'] = bot.company;
                    req.params['tenant'] = bot.tenant;
                    req.params['bid'] = bot._id;
                    req.params['multi_language_enabled'] = bot.multi_language_enabled;
                    req.params['language'] = bot.language;
                    HandleMessage(req, res);
                } else {
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
        if (!Array.isArray(data.message.outmessage)) {
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
                case "text":
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
                    res.send({
                        Status: false,
                        Message: "Unknown message type."
                    });
                    return;
                    break;

            }
        }
        console.log("Request completed. \n");
        res.send({
            Status: true,
            Message: "Request completed."
        });
        return;
    } else {
        console.log("There is no out message found ");
        res.send({
            Status: false,
            Message: "No out message found."
        });
        return;
    }

};

const GetSessionsByBotID = function (req, res) {


    let webchatSessionKeyFormat = "webchatsession:" + req.params.bid + ":*";

    redis.GetAllKeysByFormat(webchatSessionKeyFormat).then((webchatKeys) => {

        let finalWebChatKeys = [];

        webchatKeys.forEach(webchatKey => {
            let chatKey = webchatKey.split("webchatsession:" + req.params.bid + ":");

            finalWebChatKeys.push(chatKey[1]);
        });
        console.log(finalWebChatKeys);
        // session created.
        // resolve(user); 

        jsonString = messageFormatter.FormatMessage(undefined, "Session retrieving has succeeded", true, finalWebChatKeys);
        res.end(jsonString);

    });
}

const SaveContext = function (req, res) {

    // domain = "https://hx3wkswmv1.execute-api.us-east-1.amazonaws.com/Prod"
    // 	config["DispatcherDomain"] = domain
    // 	Common.SaveConfig(config)
    // }

    // URL := domain + "/DBF/API/1.0.0/setContext/" + sessionId + "/" + contextKey + "/" + contextValue
    // Method := "GET"


    //     request({
    //           url: 'https://hx3wkswmv1.execute-api.us-east-1.amazonaws.com/Prod/DBF/API/1.0.0/setContext/'+ req.body.SessionID + "/" + req.body.ContextKey + "/" + req.body.ContextValue,
    //           method: 'GET'
    //       }, function (error, response) {
    //           if (error) {
    //               console.log('Error sending card : ', error);
    //               reject(response.body.error);
    //           } else if (response.body.error) {
    //               console.log('Error: ', response.body.error);
    //               reject(response.body.error);
    //           } else {
    //               resolve(response.body);
    //           }
    //       });


    var host = '';

    if (config.Host.environment === "live") {
        host = 'https://hx3wkswmv1.execute-api.us-east-1.amazonaws.com/Prod/DBF/API/1.0.0/setContext/' + req.body.SessionID + "/" + req.body.ContextKey + "/" + req.body.ContextValue;
    } else {
        host = 'https://3yi8zs68kb.execute-api.us-east-1.amazonaws.com/Prod/DBF/API/1.0.0/setContext/' + req.body.SessionID + "/" + req.body.ContextKey + "/" + req.body.ContextValue;
    }

    let args = {
        headers: {
            "companyinfo": "1:103",
            "Content-Type": "application/json",
            "x-api-key": config.Services.dispatcherAPIkey
        }
    };

    //           headerTokens["x-api-key"] = "7UpMhY6cZi1E3YnczwKk7EA0iEyCCA81RVM9Lh0b"
    // headerTokens["companyinfo"] = "1:103"
    // headerTokens["Content-Type"] = "application/json"


    let client = new Client();

    // console.log("===================host===================");
    // console.log(host);
    // console.log("===================args===================");
    // console.log(args);

    client.get(host, args, function (data, response) {
        // console.log("===================data===================");
        // console.log(data);

        res.end(JSON.stringify(data));
        // let respond = JSON.parse(data.toString('utf8'));

        // console.log("===================respond===================");
        // console.log(respond);

        // var json = {
        //     'IsSuccess': respond.IsSuccess,
        //     'url': 'https://s3.amazonaws.com/' + bucketName + '/' + imageName
        // };
        // res.send(json);
        // return next();
    });


};

module.exports = {
    GetSessionsByBotID,
    HandleMessage,
    SaveContext
    // Validate,
    // ValidateInQuickBotMode,
    // HandleMessageInQuickBotMode,
    // HandleCallback
}