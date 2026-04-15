/**
 * Prevent duplicate socket instances (important for Netlify reload behavior)
 */
if (window.socket) {
  window.socket.disconnect();
}

window.socket = io("https://circle-backend-s7dz.onrender.com");
const socket = window.socket;

// --------------------
// USERNAME
// --------------------
let username = prompt("Enter username:");
if (!username || username.trim() === "") {
  username = "anon";
}

// --------------------
// STATE
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

  if (!text || !currentCircle) return;

  socket.emit("message", {
    circle: currentCircle,
    text,
    username
  });

  msgInput.value = "";
}

// --------------------
// RECEIVE MESSAGE (FIXED DUPLICATION)
// --------------------

// IMPORTANT: ensure only one listener exists
socket.removeAllListeners("message");

socket.on("message", (data) => {
  const messagesDiv = document.getElementById("messages");

  const div = document.createElement("div");
  div.innerText = `${data.username}: ${data.text}`;

  messagesDiv.appendChild(div);
});

// --------------------
// DEBUG (optional)
// --------------------
socket.on("connect", () => {
  console.log("CONNECTED:", socket.id);
});
