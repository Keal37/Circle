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
// SOCKET CONNECTION
// --------------------
io.on("connection", (socket) => {
  console.log("CONNECTED:", socket.id);

  // --------------------
  // JOIN CIRCLE (ROOM)
  // --------------------
  socket.on("joinCircle", (circleName) => {
    const room = String(circleName || "").trim().toLowerCase();

    socket.join(room);

    console.log(`JOIN: ${socket.id} -> ${room}`);
  });

  // --------------------
  // MESSAGE HANDLING
  // --------------------
  socket.on("message", (data) => {
    const room = String(data.circle || "").trim().toLowerCase();

    // IMPORTANT: always forward full payload
    io.to(room).emit("message", {
      username: data.username || "anon",
      text: data.text || "",
      circle: room
    });
  });

  // --------------------
  // DISCONNECT
  // --------------------
  socket.on("disconnect", () => {
    console.log("DISCONNECTED:", socket.id);
  });
});

// --------------------
// START SERVER
// --------------------
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("CIRCLE running on port", PORT);
});
