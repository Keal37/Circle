const socket = io("https://circle-backend-s7dz.onrender.com");

// --------------------
// USERNAME
// --------------------
let username = localStorage.getItem("username");

if (!username || username === "null") {
  username = prompt("Enter username:");
  if (!username || username.trim() === "") {
    username = "anon";
  }
  localStorage.setItem("username", username);
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

  currentCircle = input.value.trim().toLowerCase();

  if (!currentCircle) return;

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
// RECEIVE MESSAGE
// --------------------
socket.on("message", (data) => {
  const div = document.createElement("div");
  div.innerText = `${data.username}: ${data.text}`;

  document.getElementById("messages").appendChild(div);
});

// --------------------
// DEBUG (optional)
// --------------------
socket.on("connect", () => {
  console.log("CONNECTED:", socket.id);
});
