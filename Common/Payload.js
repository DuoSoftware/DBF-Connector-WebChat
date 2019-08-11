let WhatsAppTwilioData = () => {
    return {
        accountSid: "",
        apiVersion: "",
        audienceNumber: "",
        body: "", //message body
        botNumber: "", //mobile number of the whatsapp account
        messageSid: "",
        numMedia: "",
        numSegments: "",
        smsMessageSid: "",
        smsSid: "",
        smsStatus: ""
    }
};

let Payload = () => {
    return {
        direction: "", // in | out
        bid: "", // bot id from the webhook
        platform: "", // facebook | slack | viber ....
        engagement: "", //engagement type
        from: { // sender details
            id: "",
            raw: {

            }
        },
        to: { // recipient details
            id: "",
            raw: {

            }
        },
        message: { //message from the modules
            type: "", // text | attachment | card | button....
            data: {

            }
        }
    }
};

module.exports.Payload = Payload;
module.exports.WhatsAppTwilioData = WhatsAppTwilioData;