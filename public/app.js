const socket = io("https://circle-backend-s7dz.onrender.com", {
  transports: ["websocket"],
  reconnection: true
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
// CONNECT + REJOIN
// --------------------
socket.on("connect", () => {
  console.log("CONNECTED:", socket.id);

  if (currentCircle) {
    socket.emit("joinCircle", currentCircle);
  }
});

// --------------------
// JOIN CIRCLE
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
// RECEIVE MESSAGE (GROUPED LOGIC)
// --------------------
socket.on("message", (data) => {
  const messages = document.getElementById("messages");

  const lastBlock = messages.lastElementChild;

  const isSameUser =
    lastBlock &&
    lastBlock.getAttribute("data-user") === data.username;

  const time = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });

  // ------------------------
  // CONTINUE EXISTING GROUP
  // ------------------------
  if (isSameUser) {
    const body = lastBlock.querySelector(".msg-body");

    const line = document.createElement("div");
    line.innerText = data.text;
    line.style.marginTop = "4px";

    body.appendChild(line);

    messages.scrollTop = messages.scrollHeight;
    return;
  }

  // ------------------------
  // NEW MESSAGE GROUP
  // ------------------------
  const block = document.createElement("div");
  block.classList.add("msg");
  block.setAttribute("data-user", data.username);

  block.innerHTML = `
    <div class="msg-user">${data.username}</div>

    <div class="msg-body">
      <div>${data.text}</div>
    </div>

    <div class="msg-time">${time}</div>
  `;

  // alignment + styling
  if (data.username === username) {
    block.style.alignSelf = "flex-end";
    block.style.background = "#3a7afe";
    block.style.color = "white";
  } else {
    block.style.alignSelf = "flex-start";
  }

  messages.appendChild(block);
  messages.scrollTop = messages.scrollHeight;
});
