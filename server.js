const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
  transports: ["websocket"]
});

app.use(express.static("public"));

// --------------------
// USER SOCKET MAP
// --------------------
let users = {}; // username -> socket.id

io.on("connection", (socket) => {
  console.log("CONNECTED:", socket.id);

  // --------------------
  // REGISTER USER
  // --------------------
  socket.on("register", (username) => {
    users[username] = socket.id;
    console.log("REGISTER:", username);
  });

  // --------------------
  // JOIN GROUP
  // --------------------
  socket.on("joinCircle", (circle) => {
    const room = String(circle || "").trim().toLowerCase();
    socket.join(room);
    console.log("JOIN:", socket.id, room);
  });

  // --------------------
  // GROUP MESSAGE
  // --------------------
  socket.on("message", (data) => {
    const room = String(data.circle || "").trim().toLowerCase();

    io.to(room).emit("message", {
      username: data.username,
      text: data.text,
      circle: room
    });
  });

  // --------------------
  // PRIVATE MESSAGE (REAL DM)
  // --------------------
  socket.on("dm", (data) => {
    const targetSocket = users[data.to];

    if (targetSocket) {
      io.to(targetSocket).emit("dm", data);
    }

    // also send back to sender (so they see their own message)
    socket.emit("dm", data);
  });

  // --------------------
  // DISCONNECT
  // --------------------
  socket.on("disconnect", () => {
    console.log("DISCONNECTED:", socket.id);

    // remove user
    for (let user in users) {
      if (users[user] === socket.id) {
        delete users[user];
      }
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("CIRCLE running on port", PORT);
});
