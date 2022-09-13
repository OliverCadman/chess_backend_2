const listeners = require('./listeners');

const express = require('express');

const http = require('http');


const app = express();

const socketio = require('socket.io');
const server = http.createServer(app);

const io = socketio(server, {
    cors: {
        origin: "*"
    }
}) 

io.on("connection", socket => {
    console.log("Connected")
    listeners.initializeGame(io, socket)
    
})


server.listen(process.env.PORT || 3000, () => {
    console.log("Listening on port 3001")
});
