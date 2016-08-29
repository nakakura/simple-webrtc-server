/// <reference path="../typings/index.d.ts" />
var socketIo = require('socket.io');
var fs = require('fs');
var http = require('http');
var port = process.env.VCAP_APP_PORT || 3000;
var server = http.createServer(function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(fs.readFileSync('www/index.html', 'utf-8'));
}).listen(port);
var io = socketIo.listen(server);
var hash = {};
io.sockets.on('connection', function (socket) {
    console.log("on connection");
    socket.on('list', function (data) {
        console.log("on list");
        var array = Object.keys(hash);
        socket.emit("list", array);
    });
    socket.on('login', function (data) {
        if (!("key" in data) || !("peerId" in data) || data.peerId in hash) {
            socket.disconnect();
        }
        console.log("login from " + data.peerId);
        hash[data.peerId] = socket;
        socket.peerId = data.peerId;
        socket.emit("login", { type: "login", message: "success" });
    });
    socket.on("message", function (peerId, message) {
        if (!(peerId in hash))
            return;
        hash[peerId].emit("message", message);
    });
    socket.on('disconnect', function (reason) {
        if (!('peerId' in socket))
            return;
        delete hash[socket.peerId];
        console.log("disconnect", socket.id, socket.peerId);
    });
});
//# sourceMappingURL=main.js.map