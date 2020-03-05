const validator = require('validator');
const logger = require('dvp-common-lite/LogHandler/CommonLogHandler.js').logger;
const config = require('config');
//const messageFormatter = require('dvp-common-lite/CommonMessageGenerator/ClientMessageJsonFormatter.js');
const Promise = require("bluebird");
const request = require("request")

module.exports.GetAttachmentByID = (tenant, company, id) => {

    return new Promise(function (resolve, reject) {

        if ((config.Services && config.Services.viewServiceURL && config.Services.viewServiceURL !== "")) {

            var URL = config.Services.viewServiceURL + "/DBF/API/1/ViewService/Attachment/" + id;

            request({
                method: "GET",
                url: URL,
                headers: {
                    "authorization": "bearer " + config.Services.accessToken,
                    "companyinfo": `${tenant}:${company}`,
                    "Content-Type": "application/json"
                }
            }, function (_error, _response, datax) {

                try {

                    if (!_error && _response && _response.statusCode == 200 && JSON.parse(datax).IsSuccess) {

                        resolve(JSON.parse(datax).Result);

                    } else {

                        let error = new Error(`There is an error in get attachment`);
                        reject(error);
                    }
                } catch (excep) {

                    reject(excep);
                }
            });
        } else {

            reject(new Error("Service is not configured properly "));
        }

    });
};

module.exports.GetReceiptByID = (tenant, company, id) => {

    return new Promise(function (resolve, reject) {

        if ((config.Services && config.Services.viewServiceURL && config.Services.viewServiceURL !== "")) {

            var URL = config.Services.viewServiceURL + "/DBF/API/1/ViewService/Receipt/" + id;

            request({
                method: "GET",
                url: URL,
                headers: {
                    "authorization": "bearer " + config.Services.accessToken,
                    "companyinfo": `${tenant}:${company}`,
                    "Content-Type": "application/json"
                }
            }, function (_error, _response, datax) {

                try {

                    if (!_error && _response && _response.statusCode == 200 && JSON.parse(datax).IsSuccess) {

                        resolve(JSON.parse(datax).Result);

                    } else {

                        let error = new Error(`There is an error in get receipt`);
                        reject(error);
                    }
                } catch (excep) {

                    reject(excep);
                }
            });
        } else {

            reject(new Error("Service is not configured properly "));
        }

    });
};

module.exports.GetCardByID = (tenant, company, cardid) => {

    return new Promise(function (resolve, reject) {

        if ((config.Services && config.Services.viewServiceURL && config.Services.viewServiceURL !== "")) {

            var URL = config.Services.viewServiceURL + "/DBF/API/1/ViewService/Card/" + id;

            request({
                method: "GET",
                url: URL,
                headers: {
                    "authorization": "bearer " + config.Services.accessToken,
                    "companyinfo": `${tenant}:${company}`,
                    "Content-Type": "application/json"
                }
            }, function (_error, _response, datax) {

                try {

                    if (!_error && _response && _response.statusCode == 200 && JSON.parse(datax).IsSuccess) {

                        resolve(JSON.parse(datax).Result);

                    } else {

                        let error = new Error(`There is an error in get card`);
                        reject(error);
                    }
                } catch (excep) {

                    reject(excep);
                }
            });
        } else {

            reject(new Error("Service is not configured properly "));
        }

    });
};

module.exports.GetSelectionByID = (tenant, company, selectionId) => {

    return new Promise(function (resolve, reject) {

        if ((config.Services && config.Services.viewServiceURL && config.Services.viewServiceURL !== "")) {

            var URL = config.Services.viewServiceURL + "/DBF/API/1/ViewService/Selection/" + id;

            request({
                method: "GET",
                url: URL,
                headers: {
                    "authorization": "bearer " + config.Services.accessToken,
                    "companyinfo": `${tenant}:${company}`,
                    "Content-Type": "application/json"
                }
            }, function (_error, _response, datax) {

                try {

                    if (!_error && _response && _response.statusCode == 200 && JSON.parse(datax).IsSuccess) {

                        resolve(JSON.parse(datax).Result);

                    } else {

                        let error = new Error(`There is an error in get selection`);
                        reject(error);
                    }
                } catch (excep) {

                    reject(excep);
                }
            });
        } else {

            reject(new Error("Service is not configured properly "));
        }

    });
};

module.exports.GetQuickReplyByID = (tenant, company, quickreply_id) => {

    return new Promise(function (resolve, reject) {

        if ((config.Services && config.Services.viewServiceURL && config.Services.viewServiceURL !== "")) {

            var URL = config.Services.viewServiceURL + "/DBF/API/1/ViewService/QuickReply/" + id;

            request({
                method: "GET",
                url: URL,
                headers: {
                    "authorization": "bearer " + config.Services.accessToken,
                    "companyinfo": `${tenant}:${company}`,
                    "Content-Type": "application/json"
                }
            }, function (_error, _response, datax) {

                try {

                    if (!_error && _response && _response.statusCode == 200 && JSON.parse(datax).IsSuccess) {

                        resolve(JSON.parse(datax).Result);

                    } else {

                        let error = new Error(`There is an error in get quickreply`);
                        reject(error);
                    }
                } catch (excep) {

                    reject(excep);
                }
            });
        } else {

            reject(new Error("Service is not configured properly "));
        }

    });
};

module.exports.GetMediaCardByID = (tenant, company, id) => {

    return new Promise(function (resolve, reject) {

        if ((config.Services && config.Services.viewServiceURL && config.Services.viewServiceURL !== "")) {

            var URL = config.Services.viewServiceURL + "/DBF/API/1/ViewService/MediaCard/" + id;

            request({
                method: "GET",
                url: URL,
                headers: {
                    "authorization": "bearer " + config.Services.accessToken,
                    "companyinfo": `${tenant}:${company}`,
                    "Content-Type": "application/json"
                }
            }, function (_error, _response, datax) {

                try {

                    if (!_error && _response && _response.statusCode == 200 && JSON.parse(datax).IsSuccess) {

                        resolve(JSON.parse(datax).Result);

                    } else {

                        let error = new Error(`There is an error in get media card`);
                        reject(error);
                    }
                } catch (excep) {

                    reject(excep);
                }
            });
        } else {

            reject(new Error("Service is not configured properly "));
        }

    });
};

module.exports.GetButtonsByID = (tenant, company, id) => {

    return new Promise(function (resolve, reject) {

        if ((config.Services && config.Services.viewServiceURL && config.Services.viewServiceURL !== "")) {

            var URL = config.Services.viewServiceURL + "/DBF/API/1/ViewService/ButtonList/" + id;

            request({
                method: "GET",
                url: URL,
                headers: {
                    authorization: "bearer " + config.Services.accessToken,
                    companyinfo: `${tenant}:${company}`
                }
            }, function (_error, _response, datax) {

                try {
                    if (!_error && _response && _response.statusCode == 200 && JSON.parse(datax).IsSuccess) {
                        resolve(JSON.parse(datax).Result);
                    } else {
                        console.log("There is an error in get buttons");
                        console.log(error);

                        console.log(URL);

                        console.log(config.Services.accessToken);

                        console.log(tenant);
                        console.log(company);

                        let error = new Error("There is an error in get buttons");
                        reject(error);
                    }
                } catch (excep) {
                    reject(excep);
                }
            });
        } else {
            reject(new Error("Service is not configured properly "));
        }
    });
};

module.exports.GetGeneralByID = (tenant, company, id) => {

    return new Promise(function (resolve, reject) {
        if ((config.Services && config.Services.viewServiceURL && config.Services.viewServiceURL !== "")) {

            var URL = config.Services.viewServiceURL + "/DBF/API/1/ViewService/GeneralAsset/" + id;

            request({
                method: "GET",
                url: URL,
                headers: {
                    authorization: "bearer " + config.Services.accessToken,
                    companyinfo: `${tenant}:${company}`
                }
            }, function (_error, _response, datax) {

                try {
                    if (!_error && _response && _response.statusCode == 200 && JSON.parse(datax).IsSuccess) {
                        resolve(JSON.parse(datax).Result);
                    } else {
                        let error = new Error(`There is an error in get general asset`);
                        reject(error);
                    }
                } catch (excep) {
                    reject(excep);
                }
            });
        } else {
            reject(new Error("Service is not configured properly "));
        }
    });
};