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

  const room = String(input.value || "").trim().toLowerCase();

  if (!room) return;

  currentCircle = room;

  socket.emit("joinCircle", room);

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
socket.off("message");

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
