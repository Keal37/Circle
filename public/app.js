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

username = username.trim();

// --------------------
// CIRCLE STATE
// --------------------
let currentCircle = localStorage.getItem("circle") || "";

// --------------------
// AUTO REJOIN ON CONNECT
// --------------------
socket.on("connect", () => {
  console.log("CONNECTED:", socket.id);

  if (currentCircle) {
    socket.emit("joinCircle", currentCircle.trim().toLowerCase());
  }
});

// --------------------
// JOIN CIRCLE (called from UI button)
// --------------------
function joinCircle() {
  const input = document.getElementById("circleInput");

  currentCircle = input.value.trim().toLowerCase();

  if (!currentCircle) return;

  localStorage.setItem("circle", currentCircle);

  socket.emit("joinCircle", currentCircle);

  input.value = "";
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
// RECEIVE MESSAGE (FIXED + CLEAN UI)
// --------------------
socket.on("message", (data) => {
  const messages = document.getElementById("messages");

  const div = document.createElement("div");
  div.classList.add("msg");

  // time
  const now = new Date();
  const time = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });

  // content
  div.innerHTML = `
    <div><b>${data.username}</b>: ${data.text}</div>
    <div style="font-size:10px; opacity:0.5; margin-top:3px;">
      ${time}
    </div>
  `;

  // alignment + color
  if (data.username === username) {
    div.style.alignSelf = "flex-end";
    div.style.background = "#3a7afe";
    div.style.color = "white";
  } else {
    div.style.alignSelf = "flex-start";
  }

  messages.appendChild(div);

  // auto scroll
  messages.scrollTop = messages.scrollHeight;
});
