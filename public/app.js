const socket = io("https://circle-backend-s7dz.onrender.com", {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 10,
  timeout: 20000
});

// --------------------
// USERNAME
// --------------------
let username = prompt("Enter username:");

if (!username || username.trim() === "") {
  username = "anon";
}

// --------------------
// CIRCLE STATE
// --------------------
let currentCircle = localStorage.getItem("circle");

// --------------------
// AUTO JOIN ON CONNECT / RECONNECT
// --------------------
socket.on("connect", () => {
  console.log("CONNECTED:", socket.id);

  if (currentCircle) {
    socket.emit("joinCircle", currentCircle);
  }
});

// --------------------
// SEND MESSAGE
// --------------------
function send() {
  const input = document.getElementById("msg");
  const text = input.value.trim();

  if (!text || !currentCircle) return;

  socket.emit("message", {
    circle: currentCircle.trim().toLowerCase(),
    text,
    username
  });

  input.value = "";
}

// --------------------
// RECEIVE MESSAGE
// --------------------
socket.on("message", (data) => {
  const messages = document.getElementById("messages");

  const div = document.createElement("div");
  div.innerText = `${data.username}: ${data.text}`;

  messages.appendChild(div);

  // auto scroll
  messages.scrollTop = messages.scrollHeight;
});
