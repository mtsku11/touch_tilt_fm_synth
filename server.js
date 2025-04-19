const express = require('express');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', ws => {
  console.log("Client connected");

  ws.on('message', msg => {
    const data = JSON.parse(msg);

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

app.use(express.static('public'));

server.listen(8080, () => {
  console.log("WebSocket relay + static server running at http://localhost:8080");
});
