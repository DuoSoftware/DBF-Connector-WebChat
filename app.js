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

const MessageHandler = require('./Worker/MessageHandler');

const mongooseConnection = new mongoConnection();
const port = 3675;
const version = config.Host.version;
const hpath = config.Host.hostpath;


const server = restify.createServer({
    name: "webchat-connector",
    version: '1.0.0'
}, function (req, res) {

});


const cors = corsMiddleware({
    allowHeaders: ['authorization']
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

server.get('/', (req, res) => {
    res.end(JSON.stringify({
        name: "DBF WebChat Connector",
        version: '1.0.0'
    }))
});

// server.post('/DBF/WhatsAppConnectorAPI/Twilio/sendMessage', MessageHandler.SendMessage);
server.post('/DBF/WebChatConnectorAPI/incomingMessage', MessageHandler.IncomingMessage);