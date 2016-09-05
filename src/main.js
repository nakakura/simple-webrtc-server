/// <reference path="../typings/index.d.ts" />
"use strict";
var socketIo = require('socket.io');
var fs = require('fs');
var http = require('http');
var port = process.env.VCAP_APP_PORT || 4000;
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
        console.log("login1");
        if (!("key" in data) || !("peerId" in data) || data.peerId in hash) {
            console.log("login2");
            socket.disconnect();
        }
        console.log("login3");
        hash[data.peerId] = socket;
        console.log("login4");
        socket.peerId = data.peerId;
        console.log("before emit login");
        socket.emit("login", { type: "success", message: "LOGIN_SUCCESS" });
        console.log("after emit login");
    });
    socket.on("sdp", function (peerId, message) {
        console.log("sdp");
        console.log(message);
        if (!(peerId in hash))
            return;
        hash[peerId].emit("sdp", message);
    });
    socket.on("message", function (peerId, message) {
        console.log("message");
        console.log(message);
        if (!(peerId in hash))
            return;
        hash[peerId].emit("message", message);
    });
    socket.on('disconnect', function (reason) {
        if (!('peerId' in socket))
            return;
        delete hash[socket.peerId];
    });
});
//# sourceMappingURL=main.js.map