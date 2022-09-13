let gameSocket;
let io;
let gamesInSession = [];
let rooms = {};

const initGame = (sio, socket) => {

    io = sio;
    gameSocket = socket;
    gameSocket.on("createNewGame", createNewGame);
    gameSocket.on("opponentJoinedGame", opponentJoinedGame);
    gameSocket.on("playerJoinedGame", opponentJoinedGame)
    gameSocket.on("findAllGames", findAllGames);
}

function createNewGame(data) {

    this.emit("createNewGame", {gameId: data.gameID, socketId: this.id})
    this.join(`Room-${data.gameID}`);
    this.username = data.userName.creator;


    io.sockets.in(`Room-${data.gameID}`).emit(
        'connectToRoom', `You are connected to room ${data.gameID}`);

    if (!rooms[data.gameID]) rooms[data.gameID] = {};
    rooms[data.gameID].creator = this.username;
    rooms[data.gameID].isOpen = true;
    rooms[data.gameID].players = [this.username];

    if (!gamesInSession.includes(rooms[data.gameID])) gamesInSession.push(rooms);
}

function opponentJoinedGame(data) {
    let socket = this;
    const gameID = data.gameID.slice(5);

    const room = gamesInSession.map((room) => {
        if (!room[gameID]) {
            socket.emit("status", "Game doesn't exist.")
        } 
        return room[gameID]
    })

    if (room[0].players.length < 2) {
        socket.join(data.gameID);
        room[0].players.push(data.opponentUserName)
    } else {
        socket.emit('status', 'This room is full.')
    }
}

function findAllGames() {

    const rooms = Array.from(io.sockets.adapter.rooms);
    const roomsWithGameID = rooms.filter((room) => {
        // Filter out rooms explicitly created with an
        // added object specifying gameID, and creator.
        if (room[0].length === 41) {
            return room
        } 
    })


    io.emit('listAllGames', roomsWithGameID)
}

exports.initializeGame = initGame