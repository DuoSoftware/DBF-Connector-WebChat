const request = require('request');
const config = require('config');
const messageFormatter = require('dvp-common-lite/CommonMessageGenerator/ClientMessageJsonFormatter.js');
// let PAGE_ACCESS_TOKEN = config.Facebook.pageAccessToken;
const TemplateService = require('../Templates/WebChatTemplate.js');
const DynamicTemplate = require('../Templates/DynamicTemplate.js');
const ViewService = require('../Utility/ViewService.js');
const BotService = require('../Utility/BotService.js');
const ChannelService = require('../Utility/ChannelService');

module.exports.SendDemoPostBackMessage = function (req, res) {
    let sender = req.params.uid;

    var message = req.body.message;
    var type = "text";
    var token = req.body.token;

    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: token },
        method: 'POST',
        json: {
            "messaging_type": "RESPONSE",
            "recipient": {
                "id": sender
            },
            "message": {
                "text": message
            }
        }

    }, function (error, response) {
        if (error) {
            console.log('Error sending message: ', error);
            res.end(error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
            res.end(response.body.error);
        } else {
            res.end("success");
        }
    });
};

module.exports.GetProfile = async function (req, res) {
    const sender = req.params.uid;

    try {
        let page_token = await GetFBPageToken(req.body);
        if (page_token == "N/A")
            throw new Error("Error getting Facebook page token");

        let jsonString;

        request({
            url: `https://graph.facebook.com/v3.1/${sender}`,
            qs: { access_token: page_token },
            method: 'GET',
        }, function (error, response) {
            if (error) {
                console.log('Error sending message: ', error);
                jsonString = messageFormatter.FormatMessage(error, "Get Profile failed", false, undefined);
            } else if (response.body.error) {

                console.log('Error: ', response.body.error);
                jsonString = messageFormatter.FormatMessage(response.body.error, "Get Profile failed", false, undefined);
            } else {
                console.log("Get Profile success!");
                console.log(JSON.parse(response.body));
                jsonString = messageFormatter.FormatMessage(undefined, "Get Profile succeed", true, JSON.parse(response.body));
            }

            res.end(jsonString);
        });
    } catch (error) {
        jsonString = messageFormatter.FormatMessage(error, "Error getting while fetching user profile.", false, undefined);
        res.end(jsonString);
    }

};

module.exports.HandlePersistMenuGet = async function (req, res) {
    const company = req.user.company;
    const tenant = req.user.tenant;
    const botid = req.params.bid;
    var jsonString;

    try {
        let bot = await BotService.GetBotById(company, tenant, botid);
        if (bot && bot.Result) {
            let page_token = await GetFBPageToken(bot.Result);
            if (page_token == "N/A")
                throw new Error("Error getting Facebook page token");

            request({
                url: `https://graph.facebook.com/v3.1/me/messenger_profile`,
                qs: { fields: "persistent_menu", access_token: page_token },
                method: 'GET',
                json: {}
            }, function (error, response) {
                if (error) {
                    jsonString = messageFormatter.FormatMessage(error, "Fetching persist menus failed.", false, undefined);
                    res.end(jsonString);
                } else if (response.body.error) {
                    jsonString = messageFormatter.FormatMessage(response.body.error, "Fetching persist menus failed.", false, undefined);
                    res.end(jsonString);
                } else {
                    jsonString = messageFormatter.FormatMessage(undefined, "Fetching persist menus succeeded", true, response.body.data[0]);
                    res.end(jsonString);
                }
            });
        } else {
            jsonString = messageFormatter.FormatMessage(undefined, "Invalid bot.", false, undefined);
            res.end(jsonString);
        }
    } catch (error) {
        jsonString = messageFormatter.FormatMessage(error, error.message || "Fetching persist menus failed.", false, undefined);
        res.end(jsonString);
    }
}

module.exports.HandlePersistMenuCreate = async function (req, res) {
    const company = req.user.company;
    const tenant = req.user.tenant;
    const botid = req.params.bid;
    var jsonString;

    try {
        let bot = await BotService.GetBotById(company, tenant, botid);
        if (bot && bot.Result) {
            let page_token = await GetFBPageToken(bot.Result);
            if (page_token == "N/A")
                throw new Error("Error getting Facebook page token");

            request({
                url: `https://graph.facebook.com/v3.1/me/messenger_profile`,
                qs: { access_token: page_token },
                method: 'POST',
                json: req.body
            }, function (error, response) {
                if (error) {
                    jsonString = messageFormatter.FormatMessage(error, "Creating persist menu failed.", false, undefined);
                    res.end(jsonString);
                } else if (response.body.error) {
                    jsonString = messageFormatter.FormatMessage(response.body.error, "Creating persist menu failed.", false, undefined);
                    res.end(jsonString);
                } else {
                    jsonString = messageFormatter.FormatMessage(undefined, "Creating persist menu successfully completed.", true, undefined);
                    res.end(jsonString);
                }
            });
        } else {
            jsonString = messageFormatter.FormatMessage(undefined, "Invalid bot.", false, undefined);
            res.end(jsonString);
        }
    } catch (error) {
        jsonString = messageFormatter.FormatMessage(error, error.message || "Creating persist menu failed.", false, undefined);
        res.end(jsonString);
    }
}

module.exports.HandlePersistMenuDelete = async function (req, res) {
    const company = req.user.company;
    const tenant = req.user.tenant;
    const botid = req.params.bid;
    var jsonString;

    try {
        let bot = await BotService.GetBotById(company, tenant, botid);
        if (bot && bot.Result) {
            let page_token = await GetFBPageToken(bot.Result);
            if (page_token == "N/A")
                throw new Error("Error getting Facebook page token");

            request({
                url: `https://graph.facebook.com/v3.1/me/messenger_profile`,
                qs: { access_token: page_token },
                method: 'POST',
                json: {
                    persistent_menu: [
                        {
                            locale: "default",
                            composer_input_disabled: false
                        }
                    ]
                }
            }, function (error, response) {
                if (error) {
                    jsonString = messageFormatter.FormatMessage(error, "Removing persist menu failed.", false, undefined);
                    res.end(jsonString);
                } else if (response.body.error) {
                    jsonString = messageFormatter.FormatMessage(response.body.error, "Removing persist menu failed.", false, undefined);
                    res.end(jsonString);
                } else {
                    jsonString = messageFormatter.FormatMessage(undefined, "Removing persist menu successfully completed.", true, response.body.data[0].whitelisted_domains);
                    res.end(jsonString);
                }
            });
        } else {
            jsonString = messageFormatter.FormatMessage(undefined, "Invalid bot.", false, undefined);
            res.end(jsonString);
        }
    } catch (error) {
        jsonString = messageFormatter.FormatMessage(error, error.message || "Removing persist menu failed.", false, undefined);
        res.end(jsonString);
    }
}

module.exports.HandleGetStartedBtnGet = async function (req, res) {
    const company = req.user.company;
    const tenant = req.user.tenant;
    const botid = req.params.bid;
    var jsonString;

    try {
        let bot = await BotService.GetBotById(company, tenant, botid);
        if (bot && bot.Result) {
            let page_token = await GetFBPageToken(bot.Result);
            if (page_token == "N/A")
                throw new Error("Error getting Facebook page token");

            request({
                url: `https://graph.facebook.com/v3.1/me/messenger_profile`,
                qs: { fields: "get_started", access_token: page_token },
                method: 'GET',
                json: {}
            }, function (error, response) {
                if (error) {
                    jsonString = messageFormatter.FormatMessage(error, "Fetching get started failed.", false, undefined);
                    res.end(jsonString);
                } else if (response.body.error) {
                    jsonString = messageFormatter.FormatMessage(response.body.error, "Fetching get started failed.", false, undefined);
                    res.end(jsonString);
                } else {
                    jsonString = messageFormatter.FormatMessage(undefined, "Fetching get started succeeded", true, response.body.data[0]);
                    res.end(jsonString);
                }
            });
        } else {
            jsonString = messageFormatter.FormatMessage(undefined, "Invalid bot.", false, undefined);
            res.end(jsonString);
        }
    } catch (error) {
        jsonString = messageFormatter.FormatMessage(error, error.message || "Fetching get started failed.", false, undefined);
        res.end(jsonString);
    }
}

module.exports.HandleGetStartedBtnCreate = async function (req, res) {
    const company = req.user.company;
    const tenant = req.user.tenant;
    const botid = req.params.bid;
    var jsonString;

    try {
        let data = req.body;
        if (data && data.get_started && data.get_started.payload) {
            let bot = await BotService.GetBotById(company, tenant, botid);
            if (bot && bot.Result) {
                let page_token = await GetFBPageToken(bot.Result);
                if (page_token == "N/A")
                    throw new Error("Error getting Facebook page token");

                request({
                    url: `https://graph.facebook.com/v3.1/me/messenger_profile`,
                    qs: { access_token: page_token },
                    method: 'POST',
                    json: data
                }, function (error, response) {
                    if (error) {
                        jsonString = messageFormatter.FormatMessage(error, "Creating get started failed.", false, undefined);
                        res.end(jsonString);
                    } else if (response.body.error) {
                        jsonString = messageFormatter.FormatMessage(response.body.error, "Creating get started failed.", false, undefined);
                        res.end(jsonString);
                    } else {
                        jsonString = messageFormatter.FormatMessage(undefined, "Creating get started succeed", true);
                        res.end(jsonString);
                    }
                });
            } else {
                jsonString = messageFormatter.FormatMessage(undefined, "Invalid bot.", false, undefined);
                res.end(jsonString);
            }
        } else {
            jsonString = messageFormatter.FormatMessage({ message: "No get started payload found." }, "Get Started failed", false, undefined);
            res.end(jsonString);
        }

    } catch (error) {
        jsonString = messageFormatter.FormatMessage(error, "Error getting while creating get started button.", false, undefined);
        res.end(jsonString);
    }
};

module.exports.GetUrlWhitelist = async function (req, res) {
    const company = req.user.company;
    const tenant = req.user.tenant;
    const botid = req.params.bid;
    var jsonString;

    try {
        let bot = await BotService.GetBotById(company, tenant, botid);
        if (bot && bot.IsSuccess && bot.Result) {

            let botInfo = bot.Result;
            if (botInfo.channel_facebook.hasOwnProperty('page_token') && botInfo.channel_facebook.page_token != null && botInfo.channel_facebook.page_token !== '') {
                let page_token = await GetFBPageToken(bot.Result);
                if (page_token == "N/A")
                    throw new Error("Error getting Facebook page token");

                request({
                    url: `https://graph.facebook.com/v3.1/me/messenger_profile`,
                    qs: { fields: "whitelisted_domains", access_token: page_token },
                    method: 'GET',
                    json: {}
                }, function (error, response) {
                    if (error) {
                        jsonString = messageFormatter.FormatMessage(error, "Fetching whitelisted URLs failed.", false, undefined);
                        res.end(jsonString);
                    } else if (response.body.error) {
                        jsonString = messageFormatter.FormatMessage(response.body.error, "Fetching whitelisted URLs failed.", false, undefined);
                        res.end(jsonString);
                    } else {
                        let urls = (response.body.data.length > 0) ? response.body.data[0].whitelisted_domains : response.body.data;
                        jsonString = messageFormatter.FormatMessage(undefined, "Fetching whitelisted URLs succeed", true, urls);
                        res.end(jsonString);
                    }
                });
            }
            else {
                BotService.GetBotByIdFromChannel(company, tenant, 'facebook', botid).then((bot) => {
                    let botInfo = bot.Result[0];
                    let page_token = botInfo.channelFacebook.page_token;

                    request({
                        url: `https://graph.facebook.com/v3.1/me/messenger_profile`,
                        qs: { fields: "whitelisted_domains", access_token: page_token },
                        method: 'GET',
                        json: {}
                    }, function (error, response) {
                        if (error) {
                            jsonString = messageFormatter.FormatMessage(error, "Fetching whitelisted URLs failed.", false, undefined);
                            res.end(jsonString);
                        } else if (response.body.error) {
                            jsonString = messageFormatter.FormatMessage(response.body.error, "Fetching whitelisted URLs failed.", false, undefined);
                            res.end(jsonString);
                        } else {
                            let urls = (response.body.data.length > 0) ? response.body.data[0].whitelisted_domains : response.body.data;
                            jsonString = messageFormatter.FormatMessage(undefined, "Fetching whitelisted URLs succeed", true, urls);
                            res.end(jsonString);
                        }
                    });
                });
            }

        } else {
            jsonString = messageFormatter.FormatMessage(undefined, "Invalid bot.", false, undefined);
            res.end(jsonString);
        }
    } catch (error) {
        jsonString = messageFormatter.FormatMessage(error, "Error getting while fetching whitelist urls.", false, undefined);
        res.end(jsonString);
    }
}

module.exports.HandleUrlWhitelist = function (req, res) {

    const company = req.user.company;
    const tenant = req.user.tenant;
    const botid = req.params.bid;
    var jsonString;

    let data = req.body;

    if (data && data.urls) {
        if (data.urls.length > 0) {
            let payload = {
                whitelisted_domains: data.urls
            };
            BotService.GetBotById(company, tenant, botid).then(function (bot) {
                if (bot && bot.IsSuccess && bot.Result) {

                    let botInfo = bot.Result;
                    if (botInfo.channel_facebook.hasOwnProperty('page_token') && botInfo.channel_facebook.page_token != null && botInfo.channel_facebook.page_token !== '') {
                        let page_token = botInfo.channel_facebook.page_token;
                        request({
                            url: `https://graph.facebook.com/v3.1/me/messenger_profile`,
                            qs: { access_token: page_token },
                            method: 'POST',
                            json: payload
                        }, function (error, response) {
                            if (error) {
                                console.log('Error sending message: ', error);
                                jsonString = messageFormatter.FormatMessage(error, "Url whitelisting failed", false, undefined);
                                res.end(jsonString);
                            } else if (response.body.error) {
                                console.log('Error: ', response.body.error);
                                jsonString = messageFormatter.FormatMessage(response.body.error, "Url whitelisting failed", false, undefined);
                                res.end(jsonString);
                            } else {
                                jsonString = messageFormatter.FormatMessage(undefined, "Url whitelisting succeed", true, response.body);
                                res.end(jsonString);
                            }
                        });
                    }
                    else {
                        BotService.GetBotByIdFromChannel(company, tenant, 'facebook', botid).then((bot) => {
                            let botInfo = bot.Result[0];
                            let page_token = botInfo.channelFacebook.page_token;
                            request({
                                url: `https://graph.facebook.com/v3.1/me/messenger_profile`,
                                qs: { access_token: page_token },
                                method: 'POST',
                                json: payload
                            }, function (error, response) {
                                if (error) {
                                    console.log('Error sending message: ', error);
                                    jsonString = messageFormatter.FormatMessage(error, "Url whitelisting failed", false, undefined);
                                    res.end(jsonString);
                                } else if (response.body.error) {
                                    console.log('Error: ', response.body.error);
                                    jsonString = messageFormatter.FormatMessage(response.body.error, "Url whitelisting failed", false, undefined);
                                    res.end(jsonString);
                                } else {
                                    jsonString = messageFormatter.FormatMessage(undefined, "Url whitelisting succeed", true, response.body);
                                    res.end(jsonString);
                                }
                            });

                        }).catch((error) => {
                            jsonString = messageFormatter.FormatMessage(error, error.message || "Url whitelisting failed", false, undefined);
                            res.end(jsonString);
                        });
                    }

                }
            }).catch(function (error) {
                jsonString = messageFormatter.FormatMessage(error, error.message || "Url whitelisting failed", false, undefined);
                res.end(jsonString);
            });
        } else {
            jsonString = messageFormatter.FormatMessage({ message: "Empty array. No items to be whitelisted." }, "Url whitelisting failed", false, undefined);
            res.end(jsonString);
        }
    } else {
        jsonString = messageFormatter.FormatMessage({ message: "Empty json found." }, "Url whitelisting failed", false, undefined);
        res.end(jsonString);
    }
};

module.exports.SendMessage = async function (event) {
    // let FB_PAGE_ACCESS_TOKEN = await GetFBPageToken(event);
    // if (FB_PAGE_ACCESS_TOKEN == "N/A") {
    //     return Promise.reject("Error getting Facebook page token.");
    // }

    let sender = event.from.id;
    let recipient = event.to.id;
    let tenant = event.session.bot.tenant;
    let company = event.session.bot.company;

    //------------------
    /*var testEvent = event;
    testEvent.message.outmessage.type = "button";
    testEvent.message.outmessage.message = "5a547717f1f8b820acb1afb9";
    SendButton(testEvent);*/
    //----------------------

    var text = "error";
    if (event.message.outmessage && event.message.outmessage.type === "text") {
        if (event.message.outmessage.message != "") {
            text = event.message.outmessage.message;
        } else {
            text = "That I can't answer. Anything else you want to know? :)";
        }

        let updatedCommonJSON = await DynamicTemplate.Convert("text", event, text);

        let template = new TemplateService.WebChatTemplate(sender, recipient, "text", { text: updatedCommonJSON });
        templateJSON = template.Generate();

        return templateJSON;
        // return new Promise((resolve, reject) => {
        //     request({
        //         url: 'https://graph.facebook.com/v3.1/me/messages',
        //         qs: { access_token: FB_PAGE_ACCESS_TOKEN },
        //         method: 'POST',
        //         json: templateJSON
        //     }, function (error, response) {
        //         if (error) {
        //             console.log('Error sending message: ', error);
        //             reject(error);
        //         } else if (response.body.error) {
        //             console.log('Error: ', response.body.error);
        //             reject(response.body.error);
        //         } else {
        //             resolve(response.body)
        //         }
        //     });
        // })
    }

};

module.exports.SendAction = async function (event) {
    // let FB_PAGE_ACCESS_TOKEN = await GetFBPageToken(event);
    // if (FB_PAGE_ACCESS_TOKEN == "N/A") {
    //     return Promise.reject("Error getting Facebook page token.");
    // }

    let sender = event.from.id;
    let recipient = event.to.id;

    return {
        audienceID: sender,
        webchatID: recipient,
        sender_action: event.message.outmessage.message // mark_seen, typing_on, typing_off
    }

    // return new Promise((resolve, reject) => {
    //     request({
    //         url: 'https://graph.facebook.com/v3.1/me/messages',
    //         qs: { access_token: FB_PAGE_ACCESS_TOKEN },
    //         method: 'POST',
    //         json: {
    //             audienceID: sender,
    //             webchatID: recipient,
    //             sender_action: event.message.outmessage.message // mark_seen, typing_on, typing_off
    //         }
    //     }, function (error, response) {
    //         if (error) {
    //             console.log(`Error sending action : `, error);
    //             reject(error);
    //         } else if (response.body.error) {
    //             console.log('Error: ', response.body.error);
    //             reject(response.body.error);
    //         } else {
    //             resolve(response.body);
    //         }
    //     });
    // })
};

module.exports.SendAttachment = async function (event) {
    // let FB_PAGE_ACCESS_TOKEN = await GetFBPageToken(event);
    // if (FB_PAGE_ACCESS_TOKEN == "N/A") {
    //     return Promise.reject("Error getting Facebook page token");
    // }

    let sender = event.from.id;
    let recipient = event.to.id;
    let tenant = event.session.bot.tenant;
    let company = event.session.bot.company;

    var templateJSON = {};
    if (event.message.outmessage) {
        if (event.message.outmessage.type != "attachment") {
            console.log("Not an attachment.");
            return Promise.reject("No attachment found");
        }
    }

    let Id = event.message.outmessage.message;
    console.log("Attachment ID : " + Id);

    //Call to ViewService and get the Common JSON.
    let attachment = await ViewService.GetAttachmentByID(tenant, company, Id);

    //Pass it to Template service and get the specific facebook template.
    let template = new TemplateService.WebChatTemplate(sender, recipient, "attachment", attachment);
    templateJSON = template.Generate();

    return templateJSON;

    // return new Promise((resolve, reject) => {
    //     request({
    //         url: 'https://graph.facebook.com/v3.1/me/messages',
    //         qs: { access_token: FB_PAGE_ACCESS_TOKEN },
    //         method: 'POST',
    //         json: templateJSON
    //     }, function (error, response) {
    //         if (error) {
    //             console.log('Error sending card : ', error);
    //             reject(response.body.error);
    //         } else if (response.body.error) {
    //             console.log('Error: ', response.body.error);
    //             reject(response.body.error);
    //         } else {
    //             resolve(response.body);
    //         }
    //     });
    // });
};

module.exports.SendQuickReply = async function (event) {
    // let FB_PAGE_ACCESS_TOKEN = await GetFBPageToken(event);
    // if (FB_PAGE_ACCESS_TOKEN == "N/A") {
    //     return Promise.reject("Error getting Facebook page token");
    // }

    let sender = event.from.id;
    let recipient = event.to.id;
    let tenant = event.session.bot.tenant;
    let company = event.session.bot.company;

    var templateJSON = {};
    if (event.message.outmessage) {
        if (event.message.outmessage.type != "quickreply") {
            console.log("Not a quick reply.");
            return Promise.reject("No quick reply found.");
        }
    }

    let quickreplyid = event.message.outmessage.message;
    console.log("QuickReply ID : " + quickreplyid);

    //Call to ViewService and get the Common JSON.
    let quickReply = await ViewService.GetQuickReplyByID(tenant, company, quickreplyid);

    let updatedCommonJSON = await DynamicTemplate.Convert("quickreply", event, quickReply);

    //Pass it to Template service and get the specific facebook template.
    let template = new TemplateService.WebChatTemplate(sender, recipient, "quickreply", updatedCommonJSON);
    templateJSON = template.Generate();

    return templateJSON;

    // return new Promise((resolve, reject) => {
    //     request({
    //         url: 'https://graph.facebook.com/v2.6/me/messages',
    //         qs: { access_token: FB_PAGE_ACCESS_TOKEN },
    //         method: 'POST',
    //         json: templateJSON
    //     }, function (error, response) {
    //         if (error) {
    //             console.log('Error sending card : ', error);
    //             reject(error)
    //         } else if (response.body.error) {
    //             console.log('Error: ', response.body.error);
    //             reject(response.body.error);
    //         } else {
    //             resolve(response.body);
    //         }
    //     });
    // });
};

module.exports.SendCard = async function (event) {
    // let FB_PAGE_ACCESS_TOKEN = await GetFBPageToken(event);
    // if (FB_PAGE_ACCESS_TOKEN == "N/A") {
    //     return Promise.reject("Error getting Facebook page token");
    // }

    let sender = event.from.id;
    let recipient = event.to.id;
    let tenant = event.session.bot.tenant;
    let company = event.session.bot.company;

    var templateJSON = {};
    if (event.message.outmessage) {
        if (event.message.outmessage.type != "card") {
            console.log("Not a card.");
            return Promise.reject("No card found.");
        }
    }

    let cardId = event.message.outmessage.message;
    console.log("Card ID : " + cardId);

    //Call to ViewService and get the Common JSON.
    let card = await ViewService.GetCardByID(tenant, company, cardId);

    //pass to dynamic templater and resolve
    let updatedCommonJSON = await DynamicTemplate.Convert("card", event, card);

    let template = new TemplateService.WebChatTemplate(sender, recipient, "card", updatedCommonJSON);
    templateJSON = template.Generate();

    return templateJSON;

    // return new Promise((resolve, reject) => {
    //     request({
    //         url: 'https://graph.facebook.com/v2.6/me/messages',
    //         qs: { access_token: FB_PAGE_ACCESS_TOKEN },
    //         method: 'POST',
    //         json: templateJSON
    //     }, function (error, response) {
    //         if (error) {
    //             console.log('Error sending card : ', error);
    //             reject(error)
    //         } else if (response.body.error) {
    //             console.log('Error: ', response.body.error);
    //             reject(response.body.error)
    //         } else {
    //             resolve(response.body);
    //         }
    //     });
    // })
};


module.exports.SendGeneral = async (event) => {
    // let FB_PAGE_ACCESS_TOKEN = await GetFBPageToken(event);
    // if (FB_PAGE_ACCESS_TOKEN == "N/A") {
    //     return Promise.reject("Error getting Facebook page token");
    // }

    let sender = event.from.id;
    let recipient = event.to.id;
    let tenant = event.session.bot.tenant;
    let company = event.session.bot.company;

    var templateJSON = {};
    if (event.message.outmessage) {
        if (event.message.outmessage.type != "selection") {
            console.log("Not selection type");
            return Promise.reject("Not selection type");
        }
    }

    let generalID = event.message.outmessage.message;
    console.log("General ID : " + generalID);

    //Call to ViewService and get the Common JSON.
    let general = await ViewService.GetGeneralByID(tenant, company, generalID);

    //pass to dynamic templater and resolve
    let updatedCommonJSON = await DynamicTemplate.Convert("general", event, general);

    let template = new TemplateService.WebChatTemplate(sender, recipient, "general", updatedCommonJSON);
    templateJSON = template.Generate();

    return templateJSON;
}

module.exports.SendButton = async (event) => {
    // let FB_PAGE_ACCESS_TOKEN = await GetFBPageToken(event);
    // if (FB_PAGE_ACCESS_TOKEN == "N/A") {
    //     return Promise.reject("Error getting Facebook page token");
    // }

    let sender = event.from.id;
    let recipient = event.to.id;
    let tenant = event.session.bot.tenant;
    let company = event.session.bot.company;

    var templateJSON = {};
    if (event.message.outmessage) {
        if (event.message.outmessage.type != "button") {
            console.log("Not a button.");
            return Promise.reject("No button found.");
        }
    }

    let Id = event.message.outmessage.message;
    console.log("Button ID : " + Id);

    //Call to ViewService and get the Common JSON.
    let buttons = await ViewService.GetButtonsByID(tenant, company, Id);

    //Pass it to Template service and get the specific facebook template.
    let template = new TemplateService.WebChatTemplate(sender, recipient, "button", buttons);
    templateJSON = template.Generate();

    return templateJSON;

    // return new Promise((resolve, reject) => {
    //     request({
    //         url: 'https://graph.facebook.com/v2.6/me/messages',
    //         qs: { access_token: FB_PAGE_ACCESS_TOKEN },
    //         method: 'POST',
    //         json: templateJSON
    //     }, function (error, response) {
    //         if (error) {
    //             console.log('Error sending card : ', error);
    //             reject(error);
    //         } else if (response.body.error) {
    //             console.log('Error: ', response.body.error);
    //             reject(response.body.error);
    //         } else {
    //             resolve(response.body);
    //         }
    //     });
    // });
}


module.exports.SendSelection = async (event) => {
    // let FB_PAGE_ACCESS_TOKEN = await GetFBPageToken(event);
    // if (FB_PAGE_ACCESS_TOKEN == "N/A") {
    //     return Promise.reject("Error getting Facebook page token");
    // }

    let sender = event.from.id;
    let recipient = event.to.id;
    let tenant = event.session.bot.tenant;
    let company = event.session.bot.company;

    var templateJSON = {};
    if (event.message.outmessage) {
        if (event.message.outmessage.type != "selection") {
            console.log("Not selection type");
            return Promise.reject("Not selection type");
        }
    }

    let selectionId = event.message.outmessage.message;
    console.log("Selection ID : " + selectionId);

    //Call to ViewService and get the Common JSON.
    let selection = await ViewService.GetSelectionByID(tenant, company, selectionId);

    //pass to dynamic templater and resolve
    let updatedCommonJSON = await DynamicTemplate.Convert("selection", event, selection);

    let template = new TemplateService.WebChatTemplate(sender, recipient, "selection", updatedCommonJSON);
    templateJSON = template.Generate();

    return templateJSON;
}


module.exports.SendCalendar = async (event) => {
    // let FB_PAGE_ACCESS_TOKEN = await GetFBPageToken(event);
    // if (FB_PAGE_ACCESS_TOKEN == "N/A") {
    //     return Promise.reject("Error getting Facebook page token");
    // }

    let sender = event.from.id;
    let recipient = event.to.id;
    let tenant = event.session.bot.tenant;
    let company = event.session.bot.company;

    var templateJSON = {};
    if (event.message.outmessage) {
        if (event.message.outmessage.type != "calendar") {
            console.log("Not calendar type");
            return Promise.reject("Not calendar type");
        }
    }

    let iD = event.message.outmessage.message;
    console.log("Button ID : " + iD);

    //Call to ViewService and get the Common JSON.
    // let buttons = await ViewService.GetButtonsByID(tenant, company, Id);

    //Pass it to Template service and get the specific facebook template.
    let template = new TemplateService.WebChatTemplate(sender, recipient, "calendar", iD);
    templateJSON = template.Generate();

    return templateJSON;
}

module.exports.SendMedia = (event) => {
    // let FB_PAGE_ACCESS_TOKEN = GetFBPageToken(event);
    // if (FB_PAGE_ACCESS_TOKEN == "N/A") {
    //     return Promise.reject("Error getting Facebook page token");
    // }

    let sender = event.from.id;
    let recipient = event.to.id;
    let tenant = event.session.bot.tenant;
    let company = event.session.bot.company;

    var templateJSON = {};
    if (event.message.outmessage) {
        if (event.message.outmessage.type != "media") {
            console.log("Not an media.");
            return Promise.reject("No media found.");
        }
    }

    let Id = event.message.outmessage.message;
    console.log("Attachment ID : " + Id);
    //Call to ViewService and get the Common JSON.
    ViewService.GetMediaCardByID(tenant, company, Id).then(function (data) {
        let CommonJSON = data;
        //Pass it to Template service and get the specific facebook template.
        let template = new TemplateService.WebChatTemplate(sender, recipient, "media", CommonJSON);
        templateJSON = template.Generate();

        return templateJSON;

        // request({
        //     url: 'https://graph.facebook.com/v2.6/me/messages',
        //     qs: { access_token: FB_PAGE_ACCESS_TOKEN },
        //     method: 'POST',
        //     json: templateJSON
        // }, function (error, response) {
        //     if (error) {
        //         console.log('Error sending card : ', error);
        //     } else if (response.body.error) {
        //         console.log('Error: ', response.body.error);
        //     }
        // });
    }).catch(function (error) {
        console.log(error);
    });
}

module.exports.SendReciept = (event) => {
    // let FB_PAGE_ACCESS_TOKEN = GetFBPageToken(event);
    // if (FB_PAGE_ACCESS_TOKEN == "N/A") {
    //     return Promise.reject("Error getting Facebook page token");
    // }

    let sender = event.from.id;
    let recipient = event.to.id;
    let tenant = event.session.bot.tenant;
    let company = event.session.bot.company;

    var templateJSON = {};
    if (event.message.outmessage) {
        if (event.message.outmessage.type != "receipt") {
            console.log("Not a receipt.");
            return Promise.reject("No receipt found.");
        }
    }

    let Id = event.message.outmessage.message;
    console.log("Receipt ID : " + Id);
    //Call to ViewService and get the Common JSON.
    ViewService.GetReceiptByID(tenant, company, Id).then(function (data) {
        let CommonJSON = data;
        //pass to dynamic templater and resolve
        DynamicTemplate.Convert("receipt", event, CommonJSON).then(function (updatedCommonJSON) {
            //Pass it to Template service and get the specific facebook template.
            let template = new TemplateService.WebChatTemplate(sender, recipient, "receipt", updatedCommonJSON);
            templateJSON = template.Generate();

            return templateJSON;

            // request({
            //     url: 'https://graph.facebook.com/v2.6/me/messages',
            //     qs: { access_token: FB_PAGE_ACCESS_TOKEN },
            //     method: 'POST',
            //     json: templateJSON
            // }, function (error, response) {
            //     if (error) {
            //         console.log('Error sending card : ', error);
            //     } else if (response.body.error) {
            //         console.log('Error: ', response.body.error);
            //     }
            // });
        }).catch(function (error) {
            console.log(error);
        });
    }).catch(function (error) {
        console.log(error);
    });
}

let GetFBPageToken = async (data) => {
    let FBPageToken = "";
    if (data.session) { // invoked with dispatcher response
        if (data.session.bot) {
            let bot = data.session.bot;
            if (bot.channel_facebook && bot.channel_facebook.page_token) {
                FBPageToken = bot.channel_facebook.page_token;
            } else {
                FBPageToken = await GetFBPageTokenThroughChannel(bot["_id"]);
                // console.log("Error getting FB token : channel_facebook not found.")
                // FBPageToken = "N/A";
            }
        } else {
            console.log("Error getting FB token : bot not found.")
            FBPageToken = "N/A";
        }
    } else if (data.channel_facebook) { // invoked with s data
        FBPageToken = data.channel_facebook.page_token;
    } else {
        FBPageToken = await GetFBPageTokenThroughChannel(data["_id"]);
        // console.log("Error getting FB token : session not found.")
        // FBPageToken = "N/A";
    }

    return FBPageToken;
};

let GetFBPageTokenThroughChannel = async (botId) => {
    try {
        let channel = await ChannelService.GetBotChannelByType(botId, 'facebook');
        if (channel) {
            if (channel.channelFacebook) {
                return channel.channelFacebook.page_token
            } else {
                return "N/A";
            }
        } else {
            return "N/A";
        }
    } catch (error) {
        console.log('Error::GetFBPageTokenThroughChannel', error);
        return "N/A";
    }
}
