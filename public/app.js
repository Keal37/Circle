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
// AUTO RECONNECT
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

  if (!input) return;

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
// RECEIVE MESSAGE (CLEAN VERSION - NO GROUPING)
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

  // styling (you vs others)
  if (data.username === username) {
    div.style.alignSelf = "flex-end";
    div.style.background = "#3a7afe";
    div.style.color = "white";
  } else {
    div.style.alignSelf = "flex-start";
  }

  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
});  }

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
