const socket = io("https://circle-backend-s7dz.onrender.com", {
  transports: ["websocket"]
});

// --------------------
// USERNAME
// --------------------
let username = prompt("Enter username:");

if (!username || username.trim() === "") {
  username = "anon";
}

username = username.trim();

// --------------------
// CIRCLE
// --------------------
let currentCircle = localStorage.getItem("circle") || "";

// --------------------
// CONNECT
// --------------------
socket.on("connect", () => {
  console.log("CONNECTED:", socket.id);

  if (currentCircle) {
    socket.emit("joinCircle", currentCircle);
  }
});

// --------------------
// JOIN
// --------------------
function joinCircle() {
  const input = document.getElementById("circleInput");

  if (!input) return;

  currentCircle = input.value.trim().toLowerCase();

  if (!currentCircle) return;

  localStorage.setItem("circle", currentCircle);

  socket.emit("joinCircle", currentCircle);

  input.value = "";
}

// --------------------
// SEND
// --------------------
function send() {
  const input = document.getElementById("msg");

  if (!input) return;

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
// RECEIVE
// --------------------
socket.on("message", (data) => {
  const messages = document.getElementById("messages");

  if (!messages) return;

  const div = document.createElement("div");
  div.classList.add("msg");

  const time = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });

  div.innerHTML = `
    <div><b>${data.username}</b>: ${data.text}</div>
    <div style="font-size:10px; opacity:0.5; margin-top:3px;">
      ${time}
    </div>
  `;

  if (data.username === username) {
    div.style.alignSelf = "flex-end";
    div.style.background = "#3a7afe";
    div.style.color = "white";
  }

  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
});
