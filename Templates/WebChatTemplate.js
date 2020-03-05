class WebChatTemplate {
    constructor(AudienceID, PSID, Ttype, CommonJSON) {
        this.AudienceID = AudienceID;
        this.PSID = PSID;
        this.TemplateType = Ttype;
        this.CommonJSON = CommonJSON;

        this.TemplateJSON = this.GetBroilerPlateJSON();
    }

    GetBroilerPlateJSON() {
        return {
            audienceID: this.AudienceID,
            message: {},
            messaging_type: "RESPONSE",
            webchatID: this.PSID
        }
    }

    // {"messaging_type":"RESPONSE","audienceID":"1234547895646","webchatID":"1323456","message":{"text":"Message received"}}
    // {
    //     "audienceID": "2057280104578620",
    //     "message": {
    //         "text": "Sorry, I didn't get that."
    //     },
    //     "messaging_type": "RESPONSE",
    //     "webchatID": "2291570924231124"
    // }


    Generate() {
        switch (this.TemplateType) {
            case "attachment":
                this.TemplateJSON.message = {
                    attachment: {
                        type: this.CommonJSON.type,
                        payload: {
                            url: this.CommonJSON.payload.url,
                            is_reusable: true
                        }
                    }
                }
                break;
            case "button":
                this.TemplateJSON = GetButtonsJSON(this.CommonJSON, this.TemplateJSON);
                break;
            case "calendar":
                this.TemplateJSON.message = {
                    attachment: {
                        type: "calendar",
                        payload: {
                            id: this.CommonJSON
                        }
                    }
                }
                break;
            case "card":
                this.TemplateJSON = GetCardJSON(this.CommonJSON, this.TemplateJSON);
                break;
            case "general":
                this.TemplateJSON = GetGeneralJSON(this.CommonJSON, this.TemplateJSON);
                break;
            case "media":
                this.TemplateJSON = GetMediaCardJSON(this.CommonJSON, this.TemplateJSON);
                break;
            case "quickreply":
                if (this.CommonJSON.text) {
                    this.TemplateJSON = GetQuickReplyJSON(this.CommonJSON, this.TemplateJSON);
                } else {
                    console.log("Fatal Error : Not enough quick reply items to display");
                }
                break;
            case "receipt":
                this.TemplateJSON = GetReceiptJSON(this.CommonJSON, this.TemplateJSON);
                break;
            case "selection":
                this.TemplateJSON = GetSelectionJSON(this.CommonJSON, this.TemplateJSON);
                break;
            case "text":
                this.TemplateJSON.message.text = this.CommonJSON.text;
                // this.TemplateJSON.message = {
                //     attachment: {
                //         type: "type",
                //         payload: {
                //             url: "attachment_url",
                //             is_reusable: true
                //         }
                //     }
                // }
                break;
            default:
                console.log("ERROR : Unsupported response type.");
                this.result.message = "ERROR : Unsupported response type."
                break;
        }
        console.log("Payload to WebChat : ")
        console.log(JSON.stringify(this.TemplateJSON));

        // Payload to WebChat : 
        // {"audienceID":"recipientid","message":{"text":"Please select title","quick_replies":[{"content_type":"text","title":"Mr",
        // "payload":"mr"},{"content_type":"text","title":"Miss","payload":"miss"},{"content_type":"text","title":"Mrs","payload":"mrs"},
        // {"content_type":"text","title":"Ms","payload":"ms"}]},"messaging_type":"RESPONSE","webchatID":"senderid"}

        return this.TemplateJSON;
    }
}

let GetCardJSON = (CommonJSON, TemplateJSON) => {
    TemplateJSON.message.attachment = {
        type: "template",
        payload: {
            template_type: CommonJSON.type,
            elements: [

            ]
        }
    }

    for (var i = 0; i < CommonJSON.items.length; i++) {
        let item = CommonJSON.items[i];
        TemplateJSON.message.attachment.payload.elements[i] = {};
        TemplateJSON.message.attachment.payload.elements[i].title = item.title;
        TemplateJSON.message.attachment.payload.elements[i].subtitle = item.sub_title;
        TemplateJSON.message.attachment.payload.elements[i].image_url = item.image_url;
        if (item.default_action) {
            TemplateJSON.message.attachment.payload.elements[i].default_action = {
                type: "web_url",
                url: item.default_action.url,
                messenger_extensions: true,
                webview_height_ratio: "full",
                fallback_url: item.default_action.url
            }
        }
        if (item.buttons.length > 0) {
            TemplateJSON.message.attachment.payload.elements[i].buttons = [];

            for (var x = 0; x < item.buttons.length; x++) {
                let button = item.buttons[x];
                switch (button.type) {
                    case "web_url":
                        TemplateJSON.message.attachment.payload.elements[i].buttons[x] = {
                            type: button.type,
                            title: button.title,
                            url: button.other_data.url
                        }
                        if (button.other_data.messenger_extensions) {
                            TemplateJSON.message.attachment.payload.elements[i].buttons[x].messenger_extensions = true;
                            TemplateJSON.message.attachment.payload.elements[i].buttons[x].webview_height_ratio = "full";
                        }
                        break;
                    case "postback":
                        TemplateJSON.message.attachment.payload.elements[i].buttons[x] = {
                            type: button.type,
                            title: button.title,
                            payload: button.payload.message
                        }
                        break;
                    case "phone_number":
                        TemplateJSON.message.attachment.payload.elements[i].buttons[x] = {
                            type: button.type,
                            title: button.title,
                            payload: button.other_data.phone
                        }
                        break;
                    case "account_link":
                        TemplateJSON.message.attachment.payload.elements[i].buttons[x] = {
                            type: button.type,
                            url: button.other_data.loginUrl
                        }
                        break;
                    case "account_unlink":
                        TemplateJSON.message.attachment.payload.elements[i].buttons[x] = {
                            type: button.type
                        }
                        break;
                    default:
                        console.log("unknown button type.. Fatal error...")
                        break;
                }
            }

        }
    }

    if (CommonJSON.buttons && CommonJSON.buttons.length > 0) {
        TemplateJSON.message.attachment.payload.buttons = [];
        for (var x = 0; x < CommonJSON.buttons.length; x++) {
            let button = CommonJSON.buttons[x];
            switch (button.type) {
                case "web_url":
                    TemplateJSON.message.attachment.payload.buttons[x] = {
                        type: button.type,
                        title: button.title,
                        url: button.other_data.url
                    }
                    break;
                case "postback":
                    TemplateJSON.message.attachment.payload.buttons[x] = {
                        type: button.type,
                        title: button.title,
                        payload: button.payload.message
                    }
                    break;
                case "phone_number":
                    TemplateJSON.message.attachment.payload.buttons[x] = {
                        type: button.type,
                        title: button.title,
                        payload: button.other_data.phone
                    }
                    break;
                case "account_link":
                    TemplateJSON.message.attachment.payload.buttons[x] = {
                        type: button.type,
                        url: button.other_data.loginUrl
                    }
                    break;
                case "account_unlink":
                    TemplateJSON.message.attachment.payload.buttons[x] = {
                        type: button.type
                    }
                    break;
                default:
                    console.log("unknown button type.. Fatal error...")
                    break;
            }
        }
    }
    return TemplateJSON;
}


let GetSelectionJSON = (CommonJSON, TemplateJSON) => {
    TemplateJSON.message.attachment = {
        type: "template",
        payload: {
            template_type: CommonJSON.type,
            elements: [

            ]
        }
    }

    for (var i = 0; i < CommonJSON.items.length; i++) {
        let item = CommonJSON.items[i];
        TemplateJSON.message.attachment.payload.elements[i] = {};
        TemplateJSON.message.attachment.payload.elements[i].title = item.title;
        TemplateJSON.message.attachment.payload.elements[i].subtitle = item.sub_title;
        TemplateJSON.message.attachment.payload.elements[i].image_url = item.image_url;
        if (item.default_action) {
            TemplateJSON.message.attachment.payload.elements[i].default_action = {
                type: "web_url",
                url: item.default_action.url,
                messenger_extensions: true,
                webview_height_ratio: "full",
                fallback_url: item.default_action.url
            }
        }
        if (item.buttons.length > 0) {
            TemplateJSON.message.attachment.payload.elements[i].buttons = [];

            for (var x = 0; x < item.buttons.length; x++) {
                let button = item.buttons[x];
                switch (button.type) {
                    case "web_url":
                        TemplateJSON.message.attachment.payload.elements[i].buttons[x] = {
                            type: button.type,
                            title: button.title,
                            url: button.other_data.url
                        }
                        if (button.other_data.messenger_extensions) {
                            TemplateJSON.message.attachment.payload.elements[i].buttons[x].messenger_extensions = true;
                            TemplateJSON.message.attachment.payload.elements[i].buttons[x].webview_height_ratio = "full";
                        }
                        break;
                    case "postback":
                        TemplateJSON.message.attachment.payload.elements[i].buttons[x] = {
                            type: button.type,
                            title: button.title,
                            payload: button.payload.message
                        }
                        break;
                    case "phone_number":
                        TemplateJSON.message.attachment.payload.elements[i].buttons[x] = {
                            type: button.type,
                            title: button.title,
                            payload: button.other_data.phone
                        }
                        break;
                    case "account_link":
                        TemplateJSON.message.attachment.payload.elements[i].buttons[x] = {
                            type: button.type,
                            url: button.other_data.loginUrl
                        }
                        break;
                    case "account_unlink":
                        TemplateJSON.message.attachment.payload.elements[i].buttons[x] = {
                            type: button.type
                        }
                        break;
                    default:
                        console.log("unknown button type.. Fatal error...")
                        break;
                }
            }
        }
    }

    if (CommonJSON.buttons && CommonJSON.buttons.length > 0) {
        TemplateJSON.message.attachment.payload.buttons = [];
        for (var x = 0; x < CommonJSON.buttons.length; x++) {
            let button = CommonJSON.buttons[x];
            switch (button.type) {
                case "web_url":
                    TemplateJSON.message.attachment.payload.buttons[x] = {
                        type: button.type,
                        title: button.title,
                        url: button.other_data.url
                    }
                    break;
                case "postback":
                    TemplateJSON.message.attachment.payload.buttons[x] = {
                        type: button.type,
                        title: button.title,
                        payload: button.payload.message
                    }
                    break;
                case "phone_number":
                    TemplateJSON.message.attachment.payload.buttons[x] = {
                        type: button.type,
                        title: button.title,
                        payload: button.other_data.phone
                    }
                    break;
                case "account_link":
                    TemplateJSON.message.attachment.payload.buttons[x] = {
                        type: button.type,
                        url: button.other_data.loginUrl
                    }
                    break;
                case "account_unlink":
                    TemplateJSON.message.attachment.payload.buttons[x] = {
                        type: button.type
                    }
                    break;
                default:
                    console.log("unknown button type.. Fatal error...")
                    break;
            }
        }
    }
    return TemplateJSON;
}




let GetQuickReplyJSON = (CommonJSON, TemplateJSON) => {
    TemplateJSON.message.text = CommonJSON.text;
    if (CommonJSON.items.length > 0) {
        TemplateJSON.message.quick_replies = [];
        for (var x = 0; x < CommonJSON.items.length; x++) {
            let item = CommonJSON.items[x];
            switch (item.type) {
                case "text":
                    TemplateJSON.message.quick_replies[x] = {
                        content_type: "text",
                        title: item.title,
                        payload: item.payload,
                    };
                    if (item.image) {
                        TemplateJSON.message.quick_replies[x].image_url = item.image;
                    }
                    break;
                case "location":
                    TemplateJSON.message.quick_replies[x] = {
                        content_type: "location"
                    };
                    break;
                case "user_phone_number":
                    TemplateJSON.message.quick_replies[x] = {
                        content_type: "user_phone_number"
                    };
                    break;
                case "user_email":
                    TemplateJSON.message.quick_replies[x] = {
                        content_type: "user_email"
                    };
                    break;
                default:
                    console.log("Fatal Error : Unknown quickreply item type");
                    break;
            }
        }
    }
    return TemplateJSON;
}

let GetMediaCardJSON = (CommonJSON, TemplateJSON) => {

    console.log("CommonJSON: " + JSON.stringify(CommonJSON));
    console.log("TemplateJSON: " + JSON.stringify(TemplateJSON));

    TemplateJSON.message.attachment = {
        type: "template",
        payload: {
            template_type: "media",
            elements: []
        }
    }

    for (var mediaItem of CommonJSON.items) {
        TemplateJSON.message.attachment.payload.elements[0] = {
            media_type: mediaItem.type
        }

        if (mediaItem.media_url && mediaItem.media_url != "") {
            TemplateJSON.message.attachment.payload.elements[0].url = mediaItem.media_url;
        } else if (mediaItem.attachment_id && mediaItem.attachment_id != "") {
            TemplateJSON.message.attachment.payload.elements[0].attachment_id = mediaItem.attachment_id;
        }

        if (mediaItem.buttons.length > 0) {
            TemplateJSON.message.attachment.payload.elements[0].buttons = [];
        }

        for (var x = 0; x < mediaItem.buttons.length; x++) {
            var button = mediaItem.buttons[x];
            switch (button.type) {
                case "web_url":
                    TemplateJSON.message.attachment.payload.elements[0].buttons[x] = {
                        type: button.type,
                        title: button.title,
                        url: button.other_data.url
                    }
                    break;
                case "postback":
                    TemplateJSON.message.attachment.payload.elements[0].buttons[x] = {
                        type: button.type,
                        title: button.title,
                        payload: button.payload.message
                    }
                    break;
                default:
                    console.log("unknown button type.. Fatal error...")
                    break;
            }
        }

        break; //returning at first item because webchat is limited to size 1 array for media
    }
    return TemplateJSON;
}


let GetGeneralJSON = (CommonJSON, TemplateJSON) => {
    TemplateJSON.message.attachment = {
        type: "template",
        payload: {
            template_type: "media",
            elements: []
        }
    }

    for (var mediaItem of CommonJSON.items) {
        TemplateJSON.message.attachment.payload.elements[0] = {
            media_type: mediaItem.type
        }

        if (mediaItem.media_url && mediaItem.media_url != "") {
            TemplateJSON.message.attachment.payload.elements[0].url = mediaItem.media_url;
        } else if (mediaItem.attachment_id && mediaItem.attachment_id != "") {
            TemplateJSON.message.attachment.payload.elements[0].attachment_id = mediaItem.attachment_id;
        }

        if (mediaItem.buttons.length > 0) {
            TemplateJSON.message.attachment.payload.elements[0].buttons = [];
        }

        for (var x = 0; x < mediaItem.buttons.length; x++) {
            var button = mediaItem.buttons[x];
            switch (button.type) {
                case "web_url":
                    TemplateJSON.message.attachment.payload.elements[0].buttons[x] = {
                        type: button.type,
                        title: button.title,
                        url: button.other_data.url
                    }
                    break;
                case "postback":
                    TemplateJSON.message.attachment.payload.elements[0].buttons[x] = {
                        type: button.type,
                        title: button.title,
                        payload: button.payload.message
                    }
                    break;
                default:
                    console.log("unknown button type.. Fatal error...")
                    break;
            }
        }

        break; //returning at first item because webchat is limited to size 1 array for media
    }
    return TemplateJSON;
}


let GetButtonsJSON = (CommonJSON, TemplateJSON) => {
    TemplateJSON.message.attachment = {
        type: "template",
        payload: {
            template_type: "button",
            text: "",
            buttons: []
        }
    }
    if (CommonJSON.text) {
        TemplateJSON.message.attachment.payload.text = CommonJSON.text;
    }

    for (var x = 0; x < CommonJSON.items.length; x++) {
        var button = CommonJSON.items[x];
        switch (button.type) {
            case "web_url":
                TemplateJSON.message.attachment.payload.buttons[x] = {
                    type: button.type,
                    title: button.title,
                    url: button.other_data.url
                }
                break;
            case "postback":
                TemplateJSON.message.attachment.payload.buttons[x] = {
                    type: button.type,
                    title: button.title,
                    payload: button.payload.message
                }
                break;
            default:
                console.log("unknown button type.. Fatal error...")
                break;
        }
    }

    return TemplateJSON;
}

let GetReceiptJSON = (CommonJSON, TemplateJSON) => {
    TemplateJSON.message.attachment = {
        type: "template",
        payload: {
            template_type: CommonJSON.type,
            recipient_name: CommonJSON.recipient_name,
            order_number: CommonJSON.order_number,
            currency: CommonJSON.currency,
            payment_method: CommonJSON.payment_method
        }
    }

    if (CommonJSON.order_url) {
        TemplateJSON.message.attachment.payload.order_url = CommonJSON.order_url;
    }

    if (!CommonJSON.timestamp) {
        CommonJSON.timestamp = Date.now();
    } else {
        if (new Date(CommonJSON.timestamp).getTime() > 0) {
            CommonJSON.timestamp = new Date(CommonJSON.timestamp).valueOf();
        } else {
            CommonJSON.timestamp = Date.now(); //re assign invalid date
        }
    }

    TemplateJSON.message.attachment.payload.timestamp = CommonJSON.timestamp;
    TemplateJSON.message.attachment.payload.address = {
        street1: CommonJSON.shipping_address.street,
        street2: "",
        city: CommonJSON.shipping_address.city,
        postal_code: CommonJSON.shipping_address.postalCode,
        state: CommonJSON.shipping_address.state,
        country: CommonJSON.shipping_address.country
    }

    if (CommonJSON.shipping_address.state === "" && CommonJSON.shipping_address.province != "") {
        TemplateJSON.message.attachment.payload.address.state = CommonJSON.shipping_address.province;
    }

    TemplateJSON.message.attachment.payload.adjustments = [];
    if (CommonJSON.adjustments.length > 0) {
        TemplateJSON.message.attachment.payload.adjustments = CommonJSON.adjustments;
    }

    TemplateJSON.message.attachment.payload.summary = {
        subtotal: CommonJSON.summary.sub_total,
        shipping_cost: CommonJSON.summary.shipping_cost,
        total_tax: CommonJSON.summary.total_tax,
        total_cost: CommonJSON.summary.total_cost
    }

    TemplateJSON.message.attachment.payload.elements = [];

    if (CommonJSON.elements.length > 0) {
        TemplateJSON.message.attachment.payload.elements = CommonJSON.elements;
    }
}



/*
var receiptCardSchema = new Schema({
    company: {type: Number, required: true},
    tenant: {type: Number, required: true},
    created_at: {type: Date, default: Date.now, require: true},
    updated_at: {type: Date, default: Date.now, require: true},
    type: {type: String, default:'receipt', required: true},
    recipient_name: {type: String, required:true},
    order_number: {type: String, required: true},
    currency: {type: String, required: true},
    payment_method: {type: String, required: true},
    order_url: {type:String},
    timestamp: {type:String},
    shipping_address: addressSchema,
    adjustments: [receiptAdjustmentSchema],
    summary: {
        sub_total: {type:Double},
        shipping_cost: {type:Double},
        total_tax: {type:Double},
        total_cost: {type:Double}
    },
    elements: [receiptElement]
});

 */

module.exports.WebChatTemplate = WebChatTemplate;