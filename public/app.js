const socket = io("https://circle-backend-s7dz.onrender.com");

// --------------------
// USERNAME SETUP
// --------------------
let username = localStorage.getItem("username");

if (!username) {
  username = prompt("Enter your username:");
  localStorage.setItem("username", username);
}

// --------------------
// CURRENT CIRCLE
// --------------------
let currentCircle = "";

// --------------------
// JOIN CIRCLE
// --------------------
function joinCircle() {
  const input = document.getElementById("circleInput");

  if (!input.value.trim()) return;

  currentCircle = input.value.trim();

  socket.emit("joinCircle", currentCircle);

  input.value = "";
}

// --------------------
// SEND MESSAGE
// --------------------
function send() {
  const msgInput = document.getElementById("msg");
  const text = msgInput.value.trim();

  if (!text) return;

  if (!currentCircle) {
    alert("Join a Circle first!");
    return;
  }

  socket.emit("message", {
    circle: currentCircle,
    text: text,
    username: username
  });

  msgInput.value = "";
}

// --------------------
// RECEIVE MESSAGE
// --------------------
socket.on("message", (data) => {
  const messagesDiv = document.getElementById("messages");

  const div = document.createElement("div");
  div.innerText = `${data.username}: ${data.text}`;

  messagesDiv.appendChild(div);
});
