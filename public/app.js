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

if (!currentCircle) {
  currentCircle = "";
}

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
// RECEIVE MESSAGE (STEP 2 - TIMESTAMPS + BUBBLES)
// --------------------
socket.on("message", (data) => {
  const messages = document.getElementById("messages");

  const div = document.createElement("div");
  div.classList.add("msg");

  // TIME
  const now = new Date();
  const time = now.getHours().toString().padStart(2, "0") + ":" +
               now.getMinutes().toString().padStart(2, "0");

  // YOU vs OTHERS
  if (data.username === username) {
    div.style.alignSelf = "flex-end";
    div.style.background = "#3a7afe";
    div.style.color = "white";
  } else {
    div.style.alignSelf = "flex-start";
  }

  // CONTENT
  div.innerHTML = `
    <div>${data.text}</div>
    <div style="font-size:10px; opacity:0.6; margin-top:3px;">
      ${time}
    </div>
  `;

  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
});
