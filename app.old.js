const restify = require('restify');
const config = require('config');
const messageFormatter = require('dvp-common-lite/CommonMessageGenerator/ClientMessageJsonFormatter.js');
const mongoConnection = require('dbf-dbmodels/MongoConnection');
const jwt = require('restify-jwt');
const secret = require('dvp-common-lite/Authentication/Secret.js');
const authorization = require('dvp-common-lite/Authentication/Authorization.js');
const logger = require('dvp-common-lite/LogHandler/CommonLogHandler.js').logger;
const corsMiddleware = require('restify-cors-middleware');


/*const HandleCallback = require('./Worker/MessageHandler').HandleCallback;
const HandleMessage = require('./Worker/MessageHandler').HandleMessage;
const Validator = require('./Worker/MessageHandler').Validate;
const GetProfile = require('./Worker/MessegeSender').GetProfile;
const SendDemoPostBackMessage = require('./Worker/MessegeSender').SendDemoPostBackMessage;
const HandleUrlWhitelist = require('./Worker/MessegeSender').HandleUrlWhitelist;
const GetUrlWhitelist = require('./Worker/MessegeSender').GetUrlWhitelist;*/

const FacebookHandler = require('./Worker/FacebookHandler');
const MessageHandler = require('./Worker/MessageHandler');
const MessegeSender = require('./Worker/MessegeSender');

const mongooseConnection  = new mongoConnection();
const port = config.Host.port || 3000;
const version = config.Host.version;
const hpath = config.Host.hostpath;


const server = restify.createServer({
    name: "fb-connector",
    version: '1.0.0'
}, function (req, res) {

});


const cors = corsMiddleware({
    allowHeaders: ['authorization', 'companyInfo']
})

server.pre(cors.preflight);
server.use(cors.actual);

server.use(restify.plugins.queryParser({
    mapParams: true
}));
server.use(restify.plugins.bodyParser({
    mapParams: true
}));
process.on('uncaughtException', function (err) {
    console.error(err);
    console.log("Node NOT Exiting...");
});

server.listen(port, () => {
    console.log('%s listening at %s', server.name, server.url);
});


const GetToken = function fromHeaderOrQuerystring(req) {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0].toLowerCase() === 'bearer') {
        return req.headers.authorization.split(' ')[1];
    } else if (req.params && req.params.Authorization) {
        return req.params.Authorization;
    } else if (req.query && req.query.Authorization) {
        return req.query.Authorization;
    }
    return null;
}

server.get('/', (req, res) => {
    res.end(JSON.stringify({
        name: "DBF Facebook Connector",
        version: '1.0.0'
    }))
});


server.get('/DBF/API/:version/fb_exchange_token', FacebookHandler.ExchangeToken);

server.post('/DBF/API/:version/tenant/:tenant/company/:company/bot/:bid', MessageHandler.HandleMessage);
server.get('/DBF/API/:version/tenant/:tenant/company/:company/bot/:bid', MessageHandler.Validate);
server.post('/DBF/API/:version/webhook', MessageHandler.HandleMessageInQuickBotMode);
server.get('/DBF/API/:version/webhook', MessageHandler.ValidateInQuickBotMode);

server.post('/DBF/API/:version/BotConnector/Platform/:platform/UserProfile/:uid', jwt({
        secret: secret.Secret,
        getToken: GetToken
    }),
    authorization({resource: "client", action: "read"}), MessegeSender.GetProfile);


    

   

    

server.post('/DBF/API/:version/BotConnector/Platform/:platform/Demo/:uid', jwt({
        secret: secret.Secret,
        getToken: GetToken
    }),
    authorization({resource: "client", action: "read"}), MessegeSender.SendDemoPostBackMessage);

server.post('/DBF/API/:version/platform/facebook/tenant/:tenant/company/:company/bot/:bid/callback', jwt({
        secret: secret.Secret,
        getToken: GetToken
    }),
    authorization({resource: "client", action: "read"}), MessageHandler.HandleCallback);

/* until introduce new auth realese
server.post('/DBF/API/:version/platform/facebook/bot/:bid/whitelist-url', jwt({
        secret: secret.Secret,
        getToken: GetToken
    }),
    authorization({resource: "user", action: "read"}), MessegeSender.HandleUrlWhitelist);

server.get('/DBF/API/:version/platform/facebook/bot/:bid/whitelist-url', jwt({
        secret: secret.Secret,
        getToken: GetToken
    }),
    authorization({resource: "user", action: "read"}), MessegeSender.GetUrlWhitelist);
*/

server.post('/DBF/API/:version/platform/facebook/bot/:bid/whitelist-url', MessegeSender.HandleUrlWhitelist);

server.get('/DBF/API/:version/platform/facebook/bot/:bid/whitelist-url', MessegeSender.GetUrlWhitelist);

server.get('/DBF/API/:version/platform/facebook/bot/:bid/persistmenu', jwt({secret: secret.Secret, getToken: GetToken}),
    authorization({resource: "user", action: "read"}), MessegeSender.HandlePersistMenuGet);

server.post('/DBF/API/:version/platform/facebook/bot/:bid/persistmenu', jwt({
        secret: secret.Secret,
        getToken: GetToken
    }),
    authorization({resource: "user", action: "read"}), MessegeSender.HandlePersistMenuCreate);

server.del('/DBF/API/:version/platform/facebook/bot/:bid/persistmenu', jwt({secret: secret.Secret, getToken: GetToken}),
    authorization({resource: "user", action: "read"}), MessegeSender.HandlePersistMenuDelete);

server.get('/DBF/API/:version/platform/facebook/bot/:bid/getstartedbutton', jwt({
        secret: secret.Secret,
        getToken: GetToken
    }),
    authorization({resource: "user", action: "read"}), MessegeSender.HandleGetStartedBtnGet);

server.post('/DBF/API/:version/platform/facebook/bot/:bid/getstartedbutton', jwt({
        secret: secret.Secret,
        getToken: GetToken
    }),
    authorization({resource: "user", action: "read"}), MessegeSender.HandleGetStartedBtnCreate);
