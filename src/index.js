const listeners = require('./listeners');
const serverless = require('serverless-http');
const cors = require('cors')

const express = require('express');

const http = require('http');


const app = express();

const socketio = require('socket.io');
const server = http.createServer(app);

const router = express.Router();

const allowedOrigins = ["https://react-video-chess.netlify.app/"];

const corsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed bt CORS"))
        }
    },
    optionSuccessStatus: 200
}

router.get('/', (req, res) => {
    res.send('<h1 style="font-family:Arial, san-serif;">Serving React Chess</h1>')
})

router.use(cors(corsOptions))

const io = socketio(server, {
  cors: {
    origin: "https://react-video-chess.netlify.app/",
    methods: ["GET"]
  },
}); 

io.on("connection", socket => {
    console.log("Connected")
    listeners.initializeGame(io, socket)
    
})


server.listen(process.env.PORT || 3000, () => {
    console.log("Listening on port 3001")
});

app.use('/.netlify/functions/index', router)

module.exports.handler = serverless(app)
