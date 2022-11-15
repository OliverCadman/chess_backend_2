const listeners = require('./listeners');
const serverless = require('serverless-http')

const express = require('express');

const http = require('http');


const app = express();

const socketio = require('socket.io');
const server = http.createServer(app);

const router = express.Router();

router.get('/', (req, res) => {
    res.send('<h1 style="font-family:Arial, san-serif;">Serving React Chess</h1>')
})

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

app.use('/.netlify/functions/index', router)

module.exports.handler = serverless(app)
