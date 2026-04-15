const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

// users join a Circle (room)
io.on("connection", (socket) => {

  socket.on("joinCircle", (circleName) => {
    socket.join(circleName);
  });

  socket.on("message", (data) => {
    // data = { circle, text }
    io.to(data.circle).emit("message", data);
  });

});

server.listen(3000, () => {
  console.log("CIRCLE running on port 3000");
});

