const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  transports: ["websocket"]
});

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("CONNECTED:", socket.id);

  // JOIN ROOM
  socket.on("joinCircle", (circleName) => {
    const room = String(circleName || "").trim().toLowerCase();

    socket.join(room);

    console.log("JOIN:", socket.id, room);
  });

  // MESSAGE
  socket.on("message", (data) => {
    const room = String(data.circle || "").trim().toLowerCase();

    io.to(room).emit("message", {
      username: data.username,
      text: data.text,
      circle: room
    });
  });

  socket.on("disconnect", () => {
    console.log("DISCONNECTED:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("CIRCLE running on port", PORT);
});
