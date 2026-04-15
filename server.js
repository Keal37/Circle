const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("CONNECTED:", socket.id);

  socket.on("joinCircle", (circle) => {
    socket.join(circle);
  });

  socket.on("message", (data) => {
    io.to(data.circle).emit("message", data);
  });

  socket.on("disconnect", () => {
    console.log("DISCONNECTED:", socket.id);
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log("CIRCLE running");
});
