const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

let scoreboard = {
  team1: { name: "T1", score: 0, color: "#335883", timeout: false },
  team2: { name: "T2", score: 0, color: "#33833C", timeout: false },
  time: 600,
  isPaused: true,
  period: 1,
  timeoutActive: false,
  timeoutTime: 0,
  timeoutTeam: null,
  infoText: "",
};

function broadcast(data) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

wss.on('connection', (ws) => {
  console.log('A new client connected');
  ws.send(JSON.stringify(scoreboard));
  
  ws.on('message', (data) => {
    const message = data.toString('utf-8');
    const parsedData = JSON.parse(message);
  
    console.log(parsedData);

    if (parsedData) { 
      if (parsedData.team1) scoreboard.team1 = { ...scoreboard.team1, ...parsedData.team1 };
      if (parsedData.team2) scoreboard.team2 = { ...scoreboard.team2, ...parsedData.team2 };
      if (parsedData.time !== undefined) scoreboard.time = parsedData.time;
      if (parsedData.isPaused !== undefined) scoreboard.isPaused = parsedData.isPaused;
      if (parsedData.period !== undefined) scoreboard.period = parsedData.period;
      if (parsedData.infoText !== undefined) scoreboard.infoText = parsedData.infoText;

      if (!scoreboard.timeoutActive) {
        if (scoreboard.team1.timeout && scoreboard.timeoutTeam !== "team1") {
          scoreboard.timeoutActive = true;
          scoreboard.timeoutTeam = "team1";
          scoreboard.timeoutTime = 60;
          scoreboard.isPaused = true;
        }
        else if (scoreboard.team2.timeout && scoreboard.timeoutTeam !== "team2") {
          scoreboard.timeoutActive = true;
          scoreboard.timeoutTeam = "team2";
          scoreboard.timeoutTime = 60;
          scoreboard.isPaused = true;
        }
      } else {
        if (scoreboard.timeoutTeam === "team1" && !scoreboard.team1.timeout) {
          scoreboard.timeoutActive = false;
          scoreboard.timeoutTime = 0;
          scoreboard.timeoutTeam = null;
        } else if (scoreboard.timeoutTeam === "team2" && !scoreboard.team2.timeout) {
          scoreboard.timeoutActive = false;
          scoreboard.timeoutTime = 0;
          scoreboard.timeoutTeam = null;
        }
      }

      broadcast(scoreboard);
    }
  });
});

function updateScoreboard() {
  if (scoreboard.timeoutActive) {
    scoreboard.timeoutTime -= 1;
    if (scoreboard.timeoutTime <= 0) {
      scoreboard.timeoutActive = false;
      if (scoreboard.timeoutTeam) {
        scoreboard[scoreboard.timeoutTeam].timeout = false;
      }
      scoreboard.timeoutTeam = null;
    }
  } else if (!scoreboard.isPaused) {
    scoreboard.time -= 1;
    if (scoreboard.time <= 0) {
      scoreboard.isPaused = true;
    }
  }
  broadcast(scoreboard);
}

setInterval(updateScoreboard, 1000);

console.log('WebSocket server is running on ws://localhost:8080');