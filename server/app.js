const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on("connection", function connection(ws) {
    ws.on("message", function incoming(message) {
        console.log("Received:", message);
    });
});

server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
