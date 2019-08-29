const restify = require('restify');
const config = require('config');
const mongoConnection = require('dbf-dbmodels/MongoConnection');
const authorization = require('dbf-congnitoauthorizer');
const corsMiddleware = require('restify-cors-middleware');
const workspaceAccessCheck = require('./middleware/workspaceAccessChecker');

const FacebookHandler = require('./Worker/FacebookHandler');
const MessageHandler = require('./Worker/MessageHandler');
const MessegeSender = require('./Worker/MessegeSender');

const mongooseConnection  = new mongoConnection();
const port = config.Host.port || 3675;
const version = config.Host.version;
const hpath = config.Host.hostpath;

const server = restify.createServer({
    name: "webchat-connector",
    version: '1.0.0'
}, function (req, res) {

});

const cors = corsMiddleware({
    allowHeaders: ['authorization', 'companyInfo']
});

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
        name: "DBF WebChat Connector",
        version: '1.0.0'
    }))
});

server.get('/DBF/API/WebChatConnectorAPI/fb_exchange_token', FacebookHandler.ExchangeToken);

server.post('/DBF/API/WebChatConnectorAPI/subscribe', FacebookHandler.SubscribeToApps);

server.post('/DBF/API/:version/app/unsubscribe', FacebookHandler.UnsubscribeApps);

server.post('/DBF/WebChatConnectorAPI/incomingMessage', MessageHandler.HandleMessage);

server.get('/DBF/API/:version/tenant/:tenant/company/:company/bot/:bid', MessageHandler.Validate);

server.post('/DBF/API/:version/webhook', MessageHandler.HandleMessageInQuickBotMode);

server.get('/DBF/API/:version/webhook', MessageHandler.ValidateInQuickBotMode);

server.post('/DBF/API/:version/BotConnector/Platform/:platform/UserProfile/:uid', MessegeSender.GetProfile);
 
server.post('/DBF/API/:version/platform/facebook/tenant/:tenant/company/:company/bot/:bid/callback', MessageHandler.HandleCallback);

server.post('/DBF/API/:version/BotConnector/Platform/:platform/Demo/:uid', authorization(), workspaceAccessCheck(), MessegeSender.SendDemoPostBackMessage);

server.post('/DBF/API/:version/platform/facebook/bot/:bid/whitelist-url', authorization(), workspaceAccessCheck(), MessegeSender.HandleUrlWhitelist);

server.get('/DBF/API/:version/platform/facebook/bot/:bid/whitelist-url', authorization(), workspaceAccessCheck(), MessegeSender.GetUrlWhitelist);

server.get('/DBF/API/:version/platform/facebook/bot/:bid/persistmenu', authorization(), workspaceAccessCheck(), MessegeSender.HandlePersistMenuGet);

server.post('/DBF/API/:version/platform/facebook/bot/:bid/persistmenu', authorization(), workspaceAccessCheck(), MessegeSender.HandlePersistMenuCreate);

server.del('/DBF/API/:version/platform/facebook/bot/:bid/persistmenu', authorization(), workspaceAccessCheck(), MessegeSender.HandlePersistMenuDelete);

server.get('/DBF/API/:version/platform/facebook/bot/:bid/getstartedbutton', authorization(), workspaceAccessCheck(), MessegeSender.HandleGetStartedBtnGet);

server.post('/DBF/API/:version/platform/facebook/bot/:bid/getstartedbutton', authorization(), workspaceAccessCheck(), MessegeSender.HandleGetStartedBtnCreate);
