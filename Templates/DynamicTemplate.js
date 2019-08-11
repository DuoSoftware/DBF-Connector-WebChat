var dust = require('dustjs-linkedin');
const Promise = require("bluebird");
const async = require('async');

module.exports.Convert = (TemplateType, event, CommonJSON) => {
    return new Promise(function (resolve, reject) {
        var TemplateJSON = CommonJSON;
        if (event.message.outmessage.data) {
            if (event.message.outmessage.data.type == "INT") {//conversion required...
                switch (TemplateType) {
                    case "text":
                        ConvertText(CommonJSON, TemplateJSON, event).then(function (json) {
                            resolve(json);
                        }).catch(function (error) {
                            reject(error);
                        });
                        break;
                    case "card":
                        ConvertCard(CommonJSON, TemplateJSON, event).then((data)=>{
                            resolve(data);
                        }).catch((error)=>{
                            console.log(error);
                            resolve(TemplateJSON);
                        })

                        break;
                    case "attachment":
                        break;
                    case "quickreply":
                        ConvertQuickReply(CommonJSON, TemplateJSON, event).then(function (json) {
                            resolve(json);
                        }).catch(function (error) {
                            reject(error);
                        });
                        break;
                    case "media":
                        break;
                    case "button":
                        break;
                    case "receipt":
                        ConvertReceipt(CommonJSON, TemplateJSON, event).then((data)=>{
                            resolve(data);
                        }).catch((error)=>{
                            console.log(error);
                            resolve(TemplateJSON);
                        })
                        break;
                    default:
                        console.log("ERROR : Unsupported response type.");
                        result.message = "ERROR : Unsupported response type."
                        reject("ERROR : Unsupported response type.");
                    //break;
                }
            } else {
                if (event.message.outmessage.data.context) {
                    ReshapeJSON(JSON.stringify(CommonJSON), event.message.outmessage.data.context).then(function (json) {
                        TemplateJSON = json;
                        resolve(TemplateJSON);
                    });
                }else {
                    resolve(TemplateJSON);
                }
            }
        } else {
            resolve(TemplateJSON);
        }
    });
}

//template methods
let ConvertText = (InputText, OutputText, event) => {
    return new Promise(function (resolve, reject) {
        let payload = event.message.outmessage.data.payload;

        ReshapeString(InputText, payload).then(function (json) {
            resolve(json);
        }).catch(function (error) {
            reject(error);
        });
    })
}

let ConvertCard = (CommonJSON, TemplateJSON, event) => {
    return new Promise(function (resolve, reject) {
        let payload = event.message.outmessage.data.payload;

        if (Array.isArray(payload)) {
            var baseItem = TemplateJSON.items[0];
            TemplateJSON.items = []; //reset array

            var funcArry = [];

            for (var singleItem of payload) {
                var newItem = baseItem;
                funcArry.push(reshapeEach(JSON.stringify(newItem), singleItem).invoke);
            }

            async.parallel(funcArry, (err, result) => {
                TemplateJSON.items = result;
                resolve(TemplateJSON);
            })
        } else {
            ReshapeJSON(JSON.stringify(CommonJSON), payload).then(function (json) {
                TemplateJSON = json;
                resolve(TemplateJSON);
            });
        }
    })
}

let reshapeEach = (CommonJSONStr, payload) => {
    return{
        invoke: function(callback){
            ReshapeJSON(CommonJSONStr, payload).then(function (json) {
                callback(null,json);
            });
        }
    }
}

let ConvertQuickReply = (CommonJSON, TemplateJSON, event) => {
    return new Promise(function (resolve, reject) {
        let payload = event.message.outmessage.data.payload;

        if (Array.isArray(payload)) {
            var baseItem = TemplateJSON.items[0];
            TemplateJSON.items = []; //reset array

            var funcArry = [];

            for (var singleItem of payload) {
                var newItem = baseItem;
                funcArry.push(reshapeEach(JSON.stringify(newItem), singleItem).invoke);
            }

            async.parallel(funcArry, (err, result) => {
                TemplateJSON.items = result;
                resolve(TemplateJSON);
            })
        } else {
            ReshapeJSON(JSON.stringify(CommonJSON), payload).then(function (json) {
                TemplateJSON = json;
                resolve(TemplateJSON);
            });
        }
    })
}

let ConvertReceipt = (CommonJSON, TemplateJSON, event) => {
    return new Promise(function (resolve, reject) {
        let payload = event.message.outmessage.data.payload;
        ReshapeJSON(JSON.stringify(CommonJSON), payload).then(function (json) {
            TemplateJSON = json;
            return TemplateJSON;
        });
    })
}

//helper methods
let ReshapeJSON = (jsonStr, params) => {
    return new Promise(function (resolve, reject) {
        var compiled = dust.compile(jsonStr, 'common');
        dust.loadSource(compiled);
        dust.render('common', params, function (err, out) {
            if (err) {
                reject(err);
            } else {
                var obj = JSON.parse(out);
                resolve(obj);
            }
        });
    })
}

let ReshapeString = (jsonStr, params) => {
    return new Promise(function (resolve, reject) {
        var compiled = dust.compile(jsonStr, 'common');
        dust.loadSource(compiled);
        dust.render('common', params, function (err, out) {
            if (err) {
                reject(err);
            } else {
                resolve(out);
            }
        });
    })
}
