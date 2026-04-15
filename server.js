const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// ✅ FIXED: CORS ADDED
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(express.static("public"));

// users join a Circle (room)
io.on("connection", (socket) => {

  socket.on("joinCircle", (circleName) => {
    socket.join(circleName);
  });

  socket.on("message", (data) => {
    io.to(data.circle).emit("message", data);
  });

});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("CIRCLE running on port", PORT);
});
