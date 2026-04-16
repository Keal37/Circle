const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(express.static("public"));

// username -> socket.id
let users = {};

io.on("connection", (socket) => {
  console.log("CONNECTED:", socket.id);

  // register user
  socket.on("register", (username) => {
    users[username] = socket.id;
  });

  // join group
  socket.on("joinCircle", (circle) => {
    socket.join(circle);
  });

  // group message
  socket.on("message", (data) => {
    io.to(data.circle).emit("message", data);
  });

  // private message
  socket.on("dm", (data) => {
    const targetSocket = users[data.to];

    if (targetSocket) {
      io.to(targetSocket).emit("dm", data);
    }

    socket.emit("dm", data);
  });

  // cleanup
  socket.on("disconnect", () => {
    for (let user in users) {
      if (users[user] === socket.id) {
        delete users[user];
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("CIRCLE running on", PORT));
