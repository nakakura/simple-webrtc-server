/// <reference path="../typings/index.d.ts" />

import * as socketIo from 'socket.io';
import * as fs from 'fs';
import * as http from 'http';
import * as _ from 'lodash';

const port = process.env.VCAP_APP_PORT || 4000;

const server = http.createServer((req: any, res: any)=>{
    res.writeHead(200, { 'Content-Type' : 'text/html' });
    res.end( fs.readFileSync('www/index.html', 'utf-8') );
}).listen(port);

const io = socketIo.listen(server);

const hash: {[key: string]: SocketIO.Socket} = {};

interface SocketWithPeerId extends SocketIO.Socket{
    peerId: string;
}

io.sockets.on('connection', (socket: SocketWithPeerId)=>{
    console.log("on connection");
    socket.on('list', (data: any)=>{
        console.log("on list");
        const array = Object.keys(hash);
        socket.emit("list", array);
    });

    socket.on('login', (data: any)=>{
        console.log("login1");
        if(!("key" in data) || !("peerId" in data) || data.peerId in hash) {
            console.log("login2");
            socket.disconnect();
        }

        console.log("login3");
        hash[data.peerId] = socket;
        console.log("login4");
        socket.peerId = data.peerId;
        console.log("before emit login");
        socket.emit("login", {type: "success", message: "LOGIN_SUCCESS"});
        console.log("after emit login");
    });

    socket.on("sdp", (peerId: string, message: any)=>{
        console.log("sdp");
        console.log(message);
        if(!(peerId in hash)) return;
        hash[peerId].emit("sdp", message);
    });

    socket.on("message", (peerId: string, message: any)=>{
        console.log("message");
        console.log(message);
        if(!(peerId in hash)) return;
        hash[peerId].emit("message", message);
    });

    socket.on('disconnect', (reason: string)=>{
        if(!('peerId' in socket)) return;
        delete hash[socket.peerId];
    })
});
