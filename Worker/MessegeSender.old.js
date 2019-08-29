const request = require('request');
const config = require('config');
const messageFormatter = require('dvp-common-lite/CommonMessageGenerator/ClientMessageJsonFormatter.js');
let PAGE_ACCESS_TOKEN = config.Facebook.pageAccessToken;
const TemplateService = require('../Templates/FacebookTemplate.js');
const DynamicTemplate = require('../Templates/DynamicTemplate.js');
const ViewService = require('../Utility/ViewService.js');
const BotService = require('../Utility/BotService.js');

module.exports.SendDemoPostBackMessage = function (req, res) {
    let sender = req.params.uid;

    var message = req.body.message;
    var type = "text";
    var token = req.body.token;

    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: token},
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

module.exports.GetProfile = function (req, res) {
    const sender = req.params.uid;

    if (req.body.channel_facebook.page_token) {
        FB_PAGE_ACCESS_TOKEN = req.body.channel_facebook.page_token;
    } else {
        console.log("Unable to retrieve user profile : token field not found.");
        return;
    }

    request({
        url: `https://graph.facebook.com/v2.6/${sender}`,
        qs: {access_token: FB_PAGE_ACCESS_TOKEN},
        method: 'GET',
    }, function (error, response) {

        let jsonString;
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


};

module.exports.HandlePersistMenuGet = function (req, res) {

    const company = req.user.company;
    const tenant = req.user.tenant;
    const botid = req.params.bid;
    var jsonString;

    BotService.GetBotById(company, tenant, botid).then(function (bot) {
        let page_token = bot.Result.channel_facebook.page_token;
        request({
            url: `https://graph.facebook.com/v3.1/me/messenger_profile`,
            qs: { fields:"persistent_menu", access_token: page_token},
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
    }).catch(function (error) {
        jsonString = messageFormatter.FormatMessage(error, error.message || "Fetching persist menus failed.", false, undefined);
        res.end(jsonString);
    });
}

module.exports.HandlePersistMenuCreate = function (req, res) {

    const company = req.user.company;
    const tenant = req.user.tenant;
    const botid = req.params.bid;
    var jsonString;

    BotService.GetBotById(company, tenant, botid).then(function (bot) {
        let page_token = bot.Result.channel_facebook.page_token;
        request({
            url: `https://graph.facebook.com/v3.1/me/messenger_profile`,
            qs: { access_token: page_token},
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
    }).catch(function (error) {
        jsonString = messageFormatter.FormatMessage(error, error.message || "Creating persist menu failed.", false, undefined);
        res.end(jsonString);
    });
}

module.exports.HandlePersistMenuDelete = function (req, res) {

    const company = req.user.company;
    const tenant = req.user.tenant;
    const botid = req.params.bid;
    var jsonString;

    BotService.GetBotById(company, tenant, botid).then(function (bot) {
        let page_token = bot.Result.channel_facebook.page_token;
        request({
            url: `https://graph.facebook.com/v3.1/me/messenger_profile`,
            qs: { access_token: page_token},
            method: 'POST',
            json: {
                persistent_menu:[
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
    }).catch(function (error) {
        jsonString = messageFormatter.FormatMessage(error, error.message || "Removing persist menu failed.", false, undefined);
        res.end(jsonString);
    });
}

module.exports.HandleGetStartedBtnGet = function (req, res) {

    const company = req.user.company;
    const tenant = req.user.tenant;
    const botid = req.params.bid;
    var jsonString;

    BotService.GetBotById(company, tenant, botid).then(function (bot) {
        let page_token = bot.Result.channel_facebook.page_token;
        request({
            url: `https://graph.facebook.com/v3.1/me/messenger_profile`,
            qs: { fields:"get_started", access_token: page_token},
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
    }).catch(function (error) {
        jsonString = messageFormatter.FormatMessage(error, error.message || "Fetching get started failed.", false, undefined);
        res.end(jsonString);
    });
}

module.exports.HandleGetStartedBtnCreate = function (req, res) {

    const company = req.user.company;
    const tenant = req.user.tenant;
    const botid = req.params.bid;
    var jsonString;

    BotService.GetBotById(company, tenant, botid).then(function (bot) {
        let page_token = bot.Result.channel_facebook.page_token;
        request({
            url: `https://graph.facebook.com/v3.1/me/messenger_profile`,
            qs: { access_token: page_token},
            method: 'POST',
            json: req.body
        }, function (error, response) {
            if (error) {
                jsonString = messageFormatter.FormatMessage(error, "Creating get started failed.", false, undefined);
                res.end(jsonString);
            } else if (response.body.error) {
                jsonString = messageFormatter.FormatMessage(response.body.error, "Creating get started failed.", false, undefined);
                res.end(jsonString);
            } else {
                jsonString = messageFormatter.FormatMessage(undefined, "Creating get started successfully completed.", true, response.body.data[0].whitelisted_domains);
                res.end(jsonString);
            }
        });
    }).catch(function (error) {
        jsonString = messageFormatter.FormatMessage(error, error.message || "Creating get started failed.", false, undefined);
        res.end(jsonString);
    });
}

module.exports.GetUrlWhitelist = function (req, res) {
    const company = req.user.company;
    const tenant = req.user.tenant;
    const botid = req.params.bid;
    var jsonString;

    BotService.GetBotById(company, tenant, botid).then(function (bot) {
        // let page_token = bot.Result.channel_facebook.page_token;
        let page_token = await GetFBPageToken(bot);
        request({
            url: `https://graph.facebook.com/v3.1/me/messenger_profile`,
            qs: { fields:"whitelisted_domains", access_token: page_token},
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
                let urls = (response.body.data.length > 0) ? response.body.data[0].whitelisted_domains: response.body.data;
                jsonString = messageFormatter.FormatMessage(undefined, "Fetching whitelisted URLs succeed", true, urls);
                res.end(jsonString);
            }
        });
    }).catch(function (error) {
        jsonString = messageFormatter.FormatMessage(error, error.message || "Fetching whitelisted URLs failed.", false, undefined);
        res.end(jsonString);
    });
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
                let page_token = bot.Result.channel_facebook.page_token;
                request({
                    url: `https://graph.facebook.com/v3.1/me/messenger_profile`,
                    qs: {access_token: page_token},
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
            }).catch(function (error) {
                jsonString = messageFormatter.FormatMessage(error, error.message || "Url whitelisting failed", false, undefined);
                res.end(jsonString);
            });
        } else {
            jsonString = messageFormatter.FormatMessage({message: "Empty array. No items to be whitelisted."}, "Url whitelisting failed", false, undefined);
            res.end(jsonString);
        }
    } else {
        jsonString = messageFormatter.FormatMessage({message: "Empty json found."}, "Url whitelisting failed", false, undefined);
        res.end(jsonString);
    }
}

module.exports.SendMessage = function (event) {
    let FB_PAGE_ACCESS_TOKEN = GetFBPageToken(event);
    if (FB_PAGE_ACCESS_TOKEN == "N/A") {
        return;
    }

    let sender = event.to.id;
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
        //pass to dynamic templater and resolve
        DynamicTemplate.Convert("text", event, text).then(function (updatedCommonJSON) {
            //Pass it to Template service and get the specific facebook template.
            let template = new TemplateService.FacebookTemplate(sender, "text", {text: updatedCommonJSON});
            templateJSON = template.Generate();

            request({
                url: 'https://graph.facebook.com/v2.6/me/messages',
                qs: {access_token: FB_PAGE_ACCESS_TOKEN},
                method: 'POST',
                json: templateJSON
            }, function (error, response) {
                if (error) {
                    console.log('Error sending message: ', error);
                } else if (response.body.error) {
                    console.log('Error: ', response.body.error);
                }
            });
        }).catch(function (error) {
            console.log(error);
        });
    }

};

module.exports.SendAction = async function (event) {
    let FB_PAGE_ACCESS_TOKEN = GetFBPageToken(event);
    if (FB_PAGE_ACCESS_TOKEN == "N/A") {
        return Promise.reject("Error getting Facebook page token.");
    }

    let sender = event.to.id;

    return new Promise((resolve, reject) => {
        request({
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: {access_token: FB_PAGE_ACCESS_TOKEN},
            method: 'POST',
            json: {
                recipient: {id: sender},
                sender_action: event.message.outmessage.message // mark_seen, typing_on, typing_off
            }
        }, function (error, response) {
            if (error) {
                console.log(`Error sending action : `, error);
                reject(error);
            } else if (response.body.error) {
                console.log('Error: ', response.body.error);
                reject(response.body.error);
            }else {
                resolve(response.body);
            }
        });
    })
};

module.exports.SendAttachment = function (event) {
    let FB_PAGE_ACCESS_TOKEN = GetFBPageToken(event);
    if (FB_PAGE_ACCESS_TOKEN == "N/A") {
        return;
    }

    let sender = event.to.id;
    let tenant = event.session.bot.tenant;
    let company = event.session.bot.company;

    var templateJSON = {};
    if (event.message.outmessage) {
        if (event.message.outmessage.type != "attachment") {
            console.log("Not an attachment.");
            return;
        }
    }

    let Id = event.message.outmessage.message;
    console.log("Attachment ID : " + Id);
    //Call to ViewService and get the Common JSON.
    ViewService.GetAttachmentByID(tenant, company, Id).then(function (data) {
        let CommonJSON = data;
        //Pass it to Template service and get the specific facebook template.
        let template = new TemplateService.FacebookTemplate(sender, "attachment", CommonJSON);
        templateJSON = template.Generate();
        request({
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: {access_token: FB_PAGE_ACCESS_TOKEN},
            method: 'POST',
            json: templateJSON
        }, function (error, response) {
            if (error) {
                console.log('Error sending card : ', error);
            } else if (response.body.error) {
                console.log('Error: ', response.body.error);
            }
        });
    }).catch(function (error) {
        console.log(error);
    });
};

module.exports.SendQuickReply = function (event) {
    let FB_PAGE_ACCESS_TOKEN = GetFBPageToken(event);
    if (FB_PAGE_ACCESS_TOKEN == "N/A") {
        return;
    }

    let sender = event.to.id;
    let tenant = event.session.bot.tenant;
    let company = event.session.bot.company;

    var templateJSON = {};
    if (event.message.outmessage) {
        if (event.message.outmessage.type != "quickreply") {
            console.log("Not a card.");
            return;
        }
    }

    let quickreplyid = event.message.outmessage.message;
    console.log("QuickReply ID : " + quickreplyid);
    //Call to ViewService and get the Common JSON.
    ViewService.GetQuickReplyByID(tenant, company, quickreplyid).then(function (data) {
        let CommonJSON = data;
        DynamicTemplate.Convert("quickreply", event, CommonJSON).then(function (updatedCommonJSON) {
            //Pass it to Template service and get the specific facebook template.
            let template = new TemplateService.FacebookTemplate(sender, "quickreply", CommonJSON);
            templateJSON = template.Generate();
            request({
                url: 'https://graph.facebook.com/v2.6/me/messages',
                qs: {access_token: FB_PAGE_ACCESS_TOKEN},
                method: 'POST',
                json: templateJSON
            }, function (error, response) {
                if (error) {
                    console.log('Error sending card : ', error);
                } else if (response.body.error) {
                    console.log('Error: ', response.body.error);
                }
            });
        }).catch(function (error) {
            console.log(error);
        });
    }).catch(function (error) {
        console.log(error);
    });
};

module.exports.SendCard = function (event) {
    let FB_PAGE_ACCESS_TOKEN = GetFBPageToken(event);
    if (FB_PAGE_ACCESS_TOKEN == "N/A") {
        return;
    }

    let sender = event.to.id;
    let tenant = event.session.bot.tenant;
    let company = event.session.bot.company;

    var templateJSON = {};
    if (event.message.outmessage) {
        if (event.message.outmessage.type != "card") {
            console.log("Not a card.");
            return;
        }
    }

    let cardId = event.message.outmessage.message;
    console.log("Card ID : " + cardId);
    //Call to ViewService and get the Common JSON.
    ViewService.GetCardByID(tenant, company, cardId).then(function (data) {
        let CommonJSON = data;
        //pass to dynamic templater and resolve
        DynamicTemplate.Convert("card", event, CommonJSON).then(function (updatedCommonJSON) {
            //Pass it to Template service and get the specific facebook template.
            let template = new TemplateService.FacebookTemplate(sender, "card", updatedCommonJSON);
            templateJSON = template.Generate();
            request({
                url: 'https://graph.facebook.com/v2.6/me/messages',
                qs: {access_token: FB_PAGE_ACCESS_TOKEN},
                method: 'POST',
                json: templateJSON
            }, function (error, response) {
                if (error) {
                    console.log('Error sending card : ', error);
                } else if (response.body.error) {
                    console.log('Error: ', response.body.error);
                }
            });
        }).catch(function (error) {
            console.log(error);
        });
    }).catch(function (error) {
        console.log(error);
    });
};

module.exports.SendButton = (event) => {
    let FB_PAGE_ACCESS_TOKEN = GetFBPageToken(event);
    if (FB_PAGE_ACCESS_TOKEN == "N/A") {
        return;
    }

    let sender = event.to.id;
    let tenant = event.session.bot.tenant;
    let company = event.session.bot.company;

    var templateJSON = {};
    if (event.message.outmessage) {
        if (event.message.outmessage.type != "button") {
            console.log("Not a button.");
            return;
        }
    }

    let Id = event.message.outmessage.message;
    console.log("Button ID : " + Id);
    //Call to ViewService and get the Common JSON.
    ViewService.GetButtonsByID(tenant, company, Id).then(function (data) {
        let CommonJSON = data;
        //Pass it to Template service and get the specific facebook template.
        let template = new TemplateService.FacebookTemplate(sender, "button", CommonJSON);
        templateJSON = template.Generate();
        request({
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: {access_token: FB_PAGE_ACCESS_TOKEN},
            method: 'POST',
            json: templateJSON
        }, function (error, response) {
            if (error) {
                console.log('Error sending card : ', error);
            } else if (response.body.error) {
                console.log('Error: ', response.body.error);
            }
        });
    }).catch(function (error) {
        console.log(error);
    });
}

module.exports.SendMedia = (event) => {
    let FB_PAGE_ACCESS_TOKEN = GetFBPageToken(event);
    if (FB_PAGE_ACCESS_TOKEN == "N/A") {
        return Promise.reject("Error getting Facebook page token");
    }

    let sender = event.to.id;
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
        let template = new TemplateService.FacebookTemplate(sender, "media", CommonJSON);
        templateJSON = template.Generate();
        request({
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: {access_token: FB_PAGE_ACCESS_TOKEN},
            method: 'POST',
            json: templateJSON
        }, function (error, response) {
            if (error) {
                console.log('Error sending card : ', error);
            } else if (response.body.error) {
                console.log('Error: ', response.body.error);
            }
        });
    }).catch(function (error) {
        console.log(error);
    });
}

module.exports.SendReciept = (event) => {
    let FB_PAGE_ACCESS_TOKEN = GetFBPageToken(event);
    if (FB_PAGE_ACCESS_TOKEN == "N/A") {
        return Promise.reject("Error getting Facebook page token");
    }

    let sender = event.to.id;
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
            let template = new TemplateService.FacebookTemplate(sender, "receipt", updatedCommonJSON);
            templateJSON = template.Generate();
            request({
                url: 'https://graph.facebook.com/v2.6/me/messages',
                qs: {access_token: FB_PAGE_ACCESS_TOKEN},
                method: 'POST',
                json: templateJSON
            }, function (error, response) {
                if (error) {
                    console.log('Error sending card : ', error);
                } else if (response.body.error) {
                    console.log('Error: ', response.body.error);
                }
            });
        }).catch(function (error) {
            console.log(error);
        });
    }).catch(function (error) {
        console.log(error);
    });
}

let GetFBPageToken = (data) => {
    let FBPageToken = "";
    if (data.session) {
        if (data.session.bot) {
            if (data.session.bot.channel_facebook) {
                FBPageToken = data.session.bot.channel_facebook.page_token;
            } else {
                console.log("Error getting FB token : channel_facebook not found.")
                FBPageToken = "N/A";
            }
        } else {
            console.log("Error getting FB token : bot not found.")
            FBPageToken = "N/A";
        }
    } else {
        console.log("Error getting FB token : session not found.")
        FBPageToken = "N/A";
    }

    return FBPageToken;
};