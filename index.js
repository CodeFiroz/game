const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 8080 });

let players = [];
let roles = ['Raja', 'Mantri', 'Sipahi', 'Chor'];

server.on('connection', (ws) => {
  if (players.length >= 4) {
    ws.send('Game is full!');
    ws.close();
    return;
  }

  players.push(ws);
  ws.send('Connected! Waiting for more players...');

  if (players.length === 4) {
    startGame();
  }

  ws.on('message', (message) => {
    handleGameLogic(ws, message);
  });

  ws.on('close', () => {
    players = players.filter((player) => player !== ws);
  });
});

function startGame() {
  // Shuffle roles and assign
  roles = roles.sort(() => Math.random() - 0.5);
  players.forEach((player, index) => {
    player.role = roles[index];
    player.send(`Your role is: ${player.role}`);
  });

  broadcast('All players connected! Raja, start the game by asking Mantri.');
}

function handleGameLogic(ws, message) {
  const playerRole = ws.role;
  if (playerRole === 'Raja' && message.startsWith('Ask')) {
    const mantri = players.find((player) => player.role === 'Mantri');
    mantri.send('Raja is asking you to identify the Chor.');
  } else if (playerRole === 'Mantri' && message.startsWith('Guess')) {
    const guess = message.split(' ')[1]; // Example: 'Guess Player3'
    const chor = players.find((player) => player.role === 'Chor');
    if (chor === guess) {
      broadcast('Mantri guessed correctly! Raja and Mantri earn points.');
    } else {
      broadcast('Wrong guess! Chor earns points.');
    }
    resetGame();
  }
}

function broadcast(message) {
  players.forEach((player) => player.send(message));
}

function resetGame() {
  broadcast('Game over. Restarting...');
  players = [];
}
