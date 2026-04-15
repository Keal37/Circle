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

// fallback safety
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
// RECEIVE MESSAGE (STEP 1 UI BUBBLES)
// --------------------
socket.on("message", (data) => {
  const messages = document.getElementById("messages");

  const div = document.createElement("div");
  div.classList.add("msg");

  // YOU vs OTHERS
  if (data.username === username) {
    div.style.alignSelf = "flex-end";
    div.style.background = "#3a7afe";
    div.style.color = "white";
  } else {
    div.style.alignSelf = "flex-start";
  }

  div.innerText = data.text;

  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
});
