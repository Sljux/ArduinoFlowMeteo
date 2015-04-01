var path = require('path'),
    express = require('express'),
    flowthings = require('flowthings'),
    config = require('./config');

var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server, { serveClient: true });

var clientPath = path.join(__dirname, '../client');

app.use(express.static(clientPath));

app.get('/', function (req, res) {
    res.sendFile(path.join(clientPath, 'index.html'));
});

app.get('*', function (req, res) {
    res.redirect('/');
});

var api = flowthings.API({
    account: config.accountId,
    token: config.masterToken
});

var flowId = config.meteoFlowId;

api.webSocket.connect(function (flowSocket) {
    flowSocket.flow.subscribe(flowId, function (response) {
        var drop = {
            time: response.value.creationDate,
            data: response.value.elems
        };

        io.emit('drop', drop);
    });
});

server.listen(process.env.PORT || 8080);