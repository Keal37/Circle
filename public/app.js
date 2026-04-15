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
// CIRCLE
// --------------------
let currentCircle = localStorage.getItem("circle") || "";

// --------------------
// CONNECT / REJOIN
// --------------------
socket.on("connect", () => {
  console.log("CONNECTED:", socket.id);

  if (currentCircle) {
    socket.emit("joinCircle", currentCircle);
  }
});

// --------------------
// JOIN CIRCLE (IMPORTANT SAFETY)
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
// SEND MESSAGE (SAFE)
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
// RECEIVE MESSAGE (SAFE GROUPING)
// --------------------
socket.on("message", (data) => {
  const messages = document.getElementById("messages");

  if (!messages) return;

  const lastMsg = messages.lastElementChild;

  const isSameUser =
    lastMsg &&
    lastMsg.getAttribute("data-user") === data.username;

  const time = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });

  // GROUPING
  if (isSameUser) {
    const textGroup = lastMsg.querySelector(".text-group");

    if (textGroup) {
      const newLine = document.createElement("div");
      newLine.innerText = data.text;
      newLine.style.marginTop = "4px";
      textGroup.appendChild(newLine);
    }

    messages.scrollTop = messages.scrollHeight;
    return;
  }

  // NEW MESSAGE
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

  if (data.username === username) {
    div.style.alignSelf = "flex-end";
    div.style.background = "#3a7afe";
    div.style.color = "white";
  }

  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
});
