const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("CONNECTED:", socket.id);

  socket.on("joinCircle", (circleName) => {
    const room = circleName.trim().toLowerCase();

    console.log("JOIN:", socket.id, room);

    socket.join(room);
  });

  socket.on("message", (data) => {
    const payload = {
      username: data.username,
      text: data.text,
      circle: data.circle.trim().toLowerCase()
    };

    console.log("MESSAGE:", payload);

    io.to(payload.circle).emit("message", payload);
  });

  socket.on("disconnect", () => {
    console.log("DISCONNECTED:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("CIRCLE running on port", PORT);
});
