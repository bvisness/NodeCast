var ws;
var wsMessageListenerFunctions = [];

function initWebSockets() {
    ws = new WebSocket('ws://localhost:8081', 'echo-protocol');
    for (var i = 0; i < wsMessageListenerFunctions.length; i++) {
        ws.addEventListener('message', wsMessageListenerFunctions[i]);
    }
}

function sendWebSocketMessage(msg) {
    if (!ws || ws.readyState != 1) {
        initWebSockets();
    }
    if (ws.readyState != 1) {
        ws.onopen = function() {
            sendWebSocketMessage(msg);
        }
        return;
    }

    ws.send(msg);
}

function addWebSocketMessageListener(func) {
    if (ws) {
        ws.addEventListener('message', func);
    }
    wsMessageListenerFunctions.push(func);
}
