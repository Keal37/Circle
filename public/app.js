const socket = io("https://circle-backend-s7dz.onrender.com", {
  transports: ["websocket"]
});

// --------------------
// STATE
// --------------------
let username = "";
let currentCircle = "";
let currentDM = "";
let mode = "group";

// --------------------
// INIT
// --------------------
window.addEventListener("load", () => {
  const savedId = localStorage.getItem("digiId");

  if (savedId) {
    username = savedId;
    socket.emit("register", username);
    showDashboard();
  } else {
    showLogin();
  }

  renderCircles();
  bindUI();
});

// --------------------
// VIEW CONTROL
// --------------------
function showLogin() {
  document.getElementById("login").style.display = "flex";
  document.getElementById("dashboard").style.display = "none";
  document.querySelector(".chat-wrapper").style.display = "none";
}

function showDashboard() {
  document.getElementById("login").style.display = "none";
  document.getElementById("dashboard").style.display = "flex";
  document.querySelector(".chat-wrapper").style.display = "none";
}

function showChat() {
  document.getElementById("login").style.display = "none";
  document.getElementById("dashboard").style.display = "none";
  document.querySelector(".chat-wrapper").style.display = "flex";
}

// --------------------
// LOGIN
// --------------------
function login() {
  const input = document.getElementById("digiId");
  const id = input.value.trim();

  if (!id) return;

  username = id;
  localStorage.setItem("digiId", id);

  socket.emit("register", username);

  showDashboard();
}

// make login global for HTML onclick
window.login = login;

// --------------------
// CIRCLES STORAGE
// --------------------
let circles = JSON.parse(localStorage.getItem("circles") || "[]");

function saveCircle(circle) {
  if (!circles.includes(circle)) {
    circles.push(circle);
    localStorage.setItem("circles", JSON.stringify(circles));
  }
}

// --------------------
// OPEN GROUP
// --------------------
function openCircle() {
  const input = document.getElementById("newCircle");
  const circle = input.value.trim().toLowerCase();

  if (!circle) return;

  startGroup(circle);
}

function openCircleFromList(circle) {
  startGroup(circle);
}

function startGroup(circle) {
  mode = "group";
  currentCircle = circle;

  saveCircle(circle);
  localStorage.setItem("circle", circle);

  document.getElementById("messages").innerHTML = "";

  showChat();

  socket.emit("joinCircle", circle);
}

// expose for HTML
window.openCircle = openCircle;
window.openCircleFromList = openCircleFromList;

// --------------------
// DM
// --------------------
function startDM() {
  const target = prompt("Enter username:");

  if (!target || target === username) return;

  mode = "dm";
  currentDM = target;

  document.getElementById("messages").innerHTML = "";

  showChat();
}

window.startDM = startDM;

// --------------------
// SEND MESSAGE (ONE SOURCE ONLY)
// --------------------
function send() {
  const input = document.getElementById("msg");
  const text = input.value.trim();

  if (!text) return;

  if (mode === "group") {
    if (!currentCircle) return;

    socket.emit("message", {
      circle: currentCircle,
      text,
      username
    });
  }

  if (mode === "dm") {
    if (!currentDM) return;

    socket.emit("dm", {
      to: currentDM,
      text,
      username
    });
  }

  input.value = "";
}

window.send = send;

// --------------------
// MESSAGE RENDERING (ONLY ONE SYSTEM)
// --------------------
function displayMessage(data) {
  const messages = document.getElementById("messages");

  const div = document.createElement("div");
  div.className = "msg";

  const time = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });

  div.innerHTML = `
    <div><b>${data.username}</b>: ${data.text}</div>
    <div style="font-size:10px; opacity:0.5;">${time}</div>
  `;

  if (data.username === username) {
    div.style.alignSelf = "flex-end";
    div.style.background = "#3a7afe";
    div.style.color = "white";
  }

  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

// --------------------
// SOCKET EVENTS
// --------------------
socket.on("message", (data) => {
  if (mode !== "group") return;
  displayMessage(data);
});

socket.on("dm", (data) => {
  if (mode !== "dm") return;
  displayMessage(data);
});

// --------------------
// RENDER CIRCLES
// --------------------
function renderCircles() {
  const dashboard = document.getElementById("dashboard");

  const old = document.getElementById("circleList");
  if (old) old.remove();

  if (circles.length === 0) return;

  const list = document.createElement("div");
  list.id = "circleList";
  list.style.marginTop = "20px";
  list.style.width = "220px";

  const title = document.createElement("div");
  title.innerText = "Recent Circles";
  title.style.marginBottom = "10px";
  title.style.opacity = "0.7";

  list.appendChild(title);

  circles.forEach((c) => {
    const item = document.createElement("div");

    item.innerText = c;
    item.style.padding = "10px";
    item.style.marginBottom = "6px";
    item.style.background = "#1a1a1a";
    item.style.borderRadius = "8px";
    item.style.cursor = "pointer";

    item.onclick = () => openCircleFromList(c);

    list.appendChild(item);
  });

  dashboard.appendChild(list);
}

// --------------------
// MOBILE SAFE BINDING
// --------------------
function bindUI() {
  const sendBtn = document.querySelector(".input-bar button");
  const input = document.getElementById("msg");

  if (sendBtn) {
    sendBtn.addEventListener("click", send);
  }

  if (input) {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") send();
    });
  }
}

// --------------------
// SOCKET CONNECT
// --------------------
socket.on("connect", () => {
  console.log("CONNECTED:", socket.id);

  if (currentCircle) {
    socket.emit("joinCircle", currentCircle);
  }
});

// --------------------
// LOGOUT
// --------------------
function logout() {
  localStorage.clear();
  location.reload();
}

window.logout = logout;
