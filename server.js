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
// SOCKET LOGIC
// --------------------
io.on("connection", (socket) => {
  console.log("USER CONNECTED:", socket.id);

  // JOIN CIRCLE (IMPORTANT FIX)
  socket.on("joinCircle", (circleName) => {
    socket.leaveAll(); // 🔥 prevents multiple room stacking
    socket.join(circleName);

    console.log("JOINED:", circleName);
  });

  // MESSAGE BROADCAST
  socket.on("message", (data) => {
    console.log("MESSAGE:", data);

    io.to(data.circle).emit("message", data);
  });

  socket.on("disconnect", () => {
    console.log("USER DISCONNECTED:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("CIRCLE running on port", PORT);
});
