var WebSocketServer = require('websocket').server;

var server;
var clientCount = 0;
var clients = {};

var controlPanelClient;
var liveClient;

// 
// Public functions
//

module.exports.init = function(httpServer) {
    server = new WebSocketServer({
        httpServer: httpServer
    });
    
    server.on('request', function(r) {
        var connection = r.accept('echo-protocol', r.origin);

        var id = clientCount++;
        clients[id] = connection;
        console.log((new Date()) + ' Connection accepted [' + id + ']');
        
        connection.on('message', function(message) {
            try {
                handleMessage(connection, message);
            } catch (e) {
                console.log('Error handling websocket message for client ' + id + ': ' + e);
            }
        });
        connection.on('close', function(reasonCode, description) {
            delete clients[id];
            console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
        });

        clients[id].sendUTF("Welcome to the WebSocket server!");
    });
}

//
// Private functions
// 

function handleMessage(client, message) {
    console.log('Received message with data `' + message.utf8Data + '`');
    try {
        var parsed = JSON.parse(message.utf8Data);
    } catch (e) {
        e.message += ' for string `' + message.utf8Data + '`';
        throw e;
    }

    // Handle registration messages
    if (parsed.message_type == 'register') {
        switch (parsed.client_type) {
        case 'control panel':
            controlPanelClient = client;
            console.log('Registered control panel client');
            break;
        case 'live':
            liveClient = client;
            console.log('Registered live client');
            break;
        default:
            console.log('Could not register unrecognized client type `' + parsed.client_type + '`');
        }
        return;
    }

    if (client == controlPanelClient) {
        console.log('Relaying message to live client');
        liveClient.sendUTF(message.utf8Data);
    }
}
