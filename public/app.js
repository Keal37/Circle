const socket = io("https://circle-backend-s7dz.onrender.com", {
  transports: ["websocket", "polling"]
});

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
  currentCircle = input.value;

  socket.emit("joinCircle", currentCircle);

  input.value = "";
}

// --------------------
// SEND MESSAGE
// --------------------
function send() {
  const text = document.getElementById("msg").value;

  if (!currentCircle) {
    alert("Join a Circle first!");
    return;
  }

  socket.emit("message", {
    circle: currentCircle,
    text: text,
    username: username
  });

  document.getElementById("msg").value = "";
}

// --------------------
// RECEIVE MESSAGE
// --------------------
socket.on("message", (data) => {
  const div = document.createElement("div");

  div.innerText = `${data.username}: ${data.text}`;

  document.getElementById("messages").appendChild(div);
});
