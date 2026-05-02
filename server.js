const express = require('express');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', ws => {
  console.log("Client connected");

  ws.on('message', msg => {
    let data;

    try {
      data = JSON.parse(msg);
    } catch (error) {
      console.log("Ignoring malformed message:", error.message);
      return;
    }

    if (data.type === 'touch' || data.type === 'tilt' || data.type === 'off') {
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
      console.log(`Forwarded ${data.type}:`, data);
    } else {
      console.log("Unknown or unhandled message:", data);
    }
  });

  ws.on('close', () => {
    console.log("Client disconnected");
  });
});

app.use(express.static(__dirname));

server.listen(8080, () => {
  console.log("WebSocket relay + static server running at http://localhost:8080");
});
