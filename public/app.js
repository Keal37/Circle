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
// AUTO REJOIN
// --------------------
socket.on("connect", () => {
  console.log("CONNECTED:", socket.id);

  if (currentCircle) {
    socket.emit("joinCircle", currentCircle.trim().toLowerCase());
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
// RECEIVE MESSAGE (GROUPING LOGIC)
// --------------------
socket.on("message", (data) => {
  const messages = document.getElementById("messages");

  const lastMsg = messages.lastElementChild;

  const isSameUser =
    lastMsg &&
    lastMsg.getAttribute("data-user") === data.username;

  const now = new Date();
  const time = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });

  // --------------------
  // GROUP INTO EXISTING BUBBLE
  // --------------------
  if (isSameUser) {
    const textGroup = lastMsg.querySelector(".text-group");

    const newLine = document.createElement("div");
    newLine.innerText = data.text;
    newLine.style.marginTop = "4px";

    textGroup.appendChild(newLine);

    messages.scrollTop = messages.scrollHeight;
    return;
  }

  // --------------------
  // NEW MESSAGE BLOCK
  // --------------------
  const div = document.createElement("div");
  div.classList.add("msg");
  div.setAttribute("data-user", data.username);

  div.innerHTML = `
    <div style="font-size:12px; opacity:0.7; margin-bottom:4px;">
      <b>${data.username}</b>
    </div>

    <div class="text-group">
      <div>${data.text}</div>
    </div>

    <div style="font-size:10px; opacity:0.5; margin-top:5px;">
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
  messages.scrollTop = messages.scrollHeight;
});  // auto scroll
  messages.scrollTop = messages.scrollHeight;
});
