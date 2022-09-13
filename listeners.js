let gameSocket;
let io;
let gamesInSession = [];

const initGame = (sio, socket) => {

    io = sio;
    gameSocket = socket;

    gamesInSession.push(gameSocket);
    gameSocket.on("createNewGame", createNewGame);
    gameSocket.on("opponentJoinedGame", opponentJoinedGame)
}

function createNewGame(gameId) {
    this.emit("createNewGame", {gameId: gameId, socketId: this.id})
    this.join(gameId)
    console.log(this.adapter.rooms)
}

function opponentJoinedGame(gameId) {

}

exports.initializeGame = initGame