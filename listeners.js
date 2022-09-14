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
    rooms[data.gameID].gameID = data.gameID

    if (!gamesInSession.includes(rooms[data.gameID])) gamesInSession.push(rooms);

}

function opponentJoinedGame(data) {
    let socket = this;

    const room = gamesInSession.map((room) => {
        if (!room[data.gameID]) {
            socket.emit("status", "Game doesn't exist.")
        } 
        return room[data.gameID]
    })

    if (room[0].players.length < 2) {
        socket.join(`Room-${data.gameID}`);
        room[0].players.push(data.opponentUserName)
    } else {
        socket.emit('status', 'This room is full.')
        console.log("THIS ROOM IS FULL")
    }

}

function findAllGames() {

    const currentGames = [];
    
    if (!gamesInSession) {
        io.emit('status', 'No games in session.')
    } else {
        gamesInSession.map((game) => {
            for (let property in game) {
                currentGames.push(game[property])
            }
        })
    }

    io.emit('listAllGames', currentGames);
}

exports.initializeGame = initGame