let gameSocket;
let io;
let gamesInSession = [];
let rooms = {};

const initGame = (sio, socket) => {
  console.log("hello");
  io = sio;
  gameSocket = socket;
  gameSocket.on("createNewGame", createNewGame);
  gameSocket.on("opponentJoinedGame", opponentJoinedGame);
  gameSocket.on("playerJoinedGame", opponentJoinedGame);
  gameSocket.on("findAllGames", findAllGames);
  gameSocket.on("disconnectGame", deleteGame);
  gameSocket.on("new move", handleMove);
  gameSocket.on("requestUserName", requestUserName);
  gameSocket.on("receivedUsername", receivedUsername);

  initChat();
};

const initChat = () => {
  gameSocket.on("callUser", (data) => {
    console.group("CALL USER DATA");
    console.log(data);
    console.groupEnd();
    io.to(data.userToCall).emit("callConnected", {
      signal: data.signalData,
      from: data.from,
    });
  });

  gameSocket.on("acceptCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal);
  });
};

function createNewGame(data) {
  // this.emit("createNewGame", {gameId: data.gameID, socketId: this.id})
  this.join(`Room-${data.gameID}`);
  this.username = data.userName.creator;

  var sock = this;

  io.sockets
    .in(`Room-${data.gameID}`)
    .emit("connectToRoom", `You are connected to room ${data.gameID}`);

  if (!rooms[data.gameID]) rooms[data.gameID] = {};
  rooms[data.gameID].creator = this.username;
  rooms[data.gameID].isOpen = true;
  rooms[data.gameID].players = [this.username];
  rooms[data.gameID].socketIDs = [sock.id];
  rooms[data.gameID].gameID = data.gameID;

  if (!gamesInSession.includes(rooms[data.gameID])) {
    gamesInSession.push(rooms[data.gameID]);
  }

  console.log("GAMES IN SESSION...", gamesInSession);

  this.emit("gameCreated", { mySocketID: this.id });
}

function requestUserName(gameID) {
  io.to(gameID).emit("giveUsername", this.id);
}

function receivedUsername(data) {
  data.socketId = this.id;
  io.to(data.gameid).emit("getOpponentUserName", data);
}

function opponentJoinedGame(data) {
  console.group("OPPONENT JOINED GAME DATA");
  console.log(data);
  console.groupEnd();
  let socket = this;

  // console.log("SOCKET", socket.id);

  const roomID = `Room-${data.gameID}`;

  const room = gamesInSession.find((room) => room.gameID === data.gameID);

  if (!room) {
    socket.emit("status", "Game doesn't exist.");
    return;
  }

  console.log("ROOM FOUND:", room);

  if (room.players.length < 2) {
    socket.join(`Room-${data.gameID}`);
    room.players.push(data.opponentUserName);
    room.socketIDs.push(socket.id);

    const socketIDArray = room.socketIDs;

    if (room.players.length === 2) {
      data.socketID = socket.id;
      data.socketIDArray = socketIDArray;
      io.sockets.in(roomID).emit("startGame", {
        ...data,
        playerNames: room.players,
      });
    }
  } else {
    socket.emit("status", "This room is full.");
  }

  io.sockets.in(roomID).emit("playerJoinedGame", {
    playerNames: room.players,
  });
}

function handleMove(data) {
  const roomID = `Room-${data.gameID}`;
  io.to(roomID).emit("opponent move", data);
}

function deleteGame(data) {
  // console.log('GAMES IN SESSION:', gamesInSession);
  gamesInSession.filter((room) => {
    console.log("ROOM!!!!!!", room);
  });
  // console.log('GAMES IN SESSION AFTER DELETE:', gamesInSession)
  // console.log("DELETE GAME DATA (2nd):", data);
}

function findAllGames() {
  if (!gamesInSession) {
    io.emit("status", "No games in session.");
  }

  io.emit("listAllGames", gamesInSession);
}

exports.initializeGame = initGame;
