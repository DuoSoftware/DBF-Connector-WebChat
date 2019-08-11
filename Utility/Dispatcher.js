const validator = require('validator');
const config = require('config');
const messageFormatter = require('dvp-common-lite/CommonMessageGenerator/ClientMessageJsonFormatter.js');
const Promise = require("bluebird");
const request = require("request")

module.exports.InvokeDispatch = function (company, tenant, payload) {

    return new Promise(function (resolve, reject) {
        if ((config.Services && config.Services.dispatchServiceHost && config.Services.dispatchServicePort && config.Services.dispatchServiceVersion)) {

            var dispatchURL = config.Services.dispatchServiceProtocol + "://" + config.Services.dispatchServiceHost + "/DBF/API/" + config.Services.dispatchServiceVersion + "/Dispatcher/Invoke/";

            if (validator.isIP(config.Services.dispatchServiceHost)) {
                dispatchURL = config.Services.dispatchServiceProtocol + "://" + config.Services.dispatchServiceHost + ":" + config.Services.dispatchServicePort + "/DBF/API/" + config.Services.dispatchServiceVersion + "/Dispatcher/Invoke/";
            }
            
            request({
                method: "POST",
                url: dispatchURL,
                // headers: {
                //     "authorization": "bearer " + config.Services.accessToken,
                //     "companyinfo": tenant + ":" + company,
                //     "content-type": "application/json"
                // },
                headers: {
                    "companyinfo": tenant + ":" + company,
                    "content-type": "application/json",
                    "x-api-key": config.Services.dispatcherAPIkey
                },
                json: payload
            }, function (_error, _response, datax) {
                try {

                    if (!_error && _response && _response.statusCode == 200 && _response.body) {
                        resolve(_response.body);

                    } else {
                        console.log("\n======== Error occurred in InvokeDispatch ========");
                        console.log(_error);

                        let error = new Error("There is an error in invoke dispatcher");
                        reject(error);
                    }
                } catch (excep) {
                    console.log("\n======== Exception occurred in InvokeDispatch ========");
                    console.log(excep);

                    reject(excep);
                }
            });
        } else {
            reject(new Error("Service is not configured properly "));
        }
    });
};