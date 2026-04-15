const socket = io("https://circle-backend-s7dz.onrender.com");

// --------------------
// USERNAME
// --------------------
let username = localStorage.getItem("username");

if (!username) {
  username = prompt("Enter username:");
  if (!username) username = "anon";
  localStorage.setItem("username", username);
}

// --------------------
// GET CIRCLE
// --------------------
const currentCircle = localStorage.getItem("circle");

// join automatically
if (currentCircle) {
  socket.emit("joinCircle", currentCircle);
}

// --------------------
// SEND MESSAGE
// --------------------
function send() {
  const input = document.getElementById("msg");
  const text = input.value.trim();

  if (!text || !currentCircle) return;

  socket.emit("message", {
    circle: currentCircle,
    text,
    username
  });

  input.value = "";
}

// --------------------
// RECEIVE MESSAGE (UPDATED)
// --------------------
socket.on("message", (data) => {
  const messages = document.getElementById("messages");

  const div = document.createElement("div");
  div.innerText = `${data.username}: ${data.text}`;

  messages.appendChild(div);

  // auto scroll to latest
  messages.scrollTop = messages.scrollHeight;
});
