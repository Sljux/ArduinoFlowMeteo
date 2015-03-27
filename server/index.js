var path = require('path'),
    express = require('express'),
    flowthings = require('flowthings');

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
    account: 'sljux',
    token: '20Wp8X0BBCySqHkzitGEaizB56aBcQNj'
});

var flowId = 'f550bdf750cf28ddd51de2d9a';
var latestDrop = null;

io.on('connection', function (socket) {
    var address = socket.handshake.address;

    console.info('[%s] CONNECTED @ %s', address, new Date());

    sendInitialDrop();

    socket.on('disconnect', function () {
        console.info('[%s] DISCONNECTED @ %s', address, new Date());
    })
});

api.webSocket.connect(function (flowSocket) {
    flowSocket.flow.subscribe(flowId, function (response) {
        latestDrop = response.value;
        sendDrop()
    });
});

server.listen(8080);

function sendInitialDrop() {
    if (!latestDrop) {
        api.drop(flowId).find({limit: 1}, function (err, res) {
            if (!err) {
                latestDrop = res[0];
                sendDrop();
            }
        });
    } else {
        sendDrop();
    }
}

function sendDrop() {
    var drop = {
        time: latestDrop.creationDate,
        data: latestDrop.elems
    };

    io.emit('drop', drop);
}