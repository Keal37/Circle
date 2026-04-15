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

// --------------------
// STORE USERS PER CIRCLE
// --------------------
const circleUsers = {};

// --------------------
// SOCKET
// --------------------
io.on("connection", (socket) => {
  console.log("CONNECTED:", socket.id);

  let currentCircle = null;
  let username = null;

  // JOIN CIRCLE
  socket.on("joinCircle", (circleName) => {
    currentCircle = String(circleName || "").trim().toLowerCase();

    socket.join(currentCircle);

    if (!circleUsers[currentCircle]) {
      circleUsers[currentCircle] = [];
    }

    console.log("JOIN:", socket.id, currentCircle);
  });

  // MESSAGE
  socket.on("message", (data) => {
    currentCircle = String(data.circle || "").trim().toLowerCase();
    username = data.username;

    io.to(currentCircle).emit("message", {
      username: data.username,
      text: data.text,
      circle: currentCircle
    });
  });

  // REGISTER USER ONLINE
  socket.on("userOnline", (data) => {
    const circle = String(data.circle || "").trim().toLowerCase();
    const user = data.username;

    if (!circleUsers[circle]) circleUsers[circle] = [];

    // avoid duplicates
    if (!circleUsers[circle].includes(user)) {
      circleUsers[circle].push(user);
    }

    io.to(circle).emit("onlineUsers", circleUsers[circle]);
  });

  // DISCONNECT
  socket.on("disconnect", () => {
    console.log("DISCONNECTED:", socket.id);

    if (currentCircle && username && circleUsers[currentCircle]) {
      circleUsers[currentCircle] = circleUsers[currentCircle].filter(
        (u) => u !== username
      );

      io.to(currentCircle).emit(
        "onlineUsers",
        circleUsers[currentCircle]
      );
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("CIRCLE running on port", PORT);
});
