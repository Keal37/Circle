const socket = io("https://circle-backend-s7dz.onrender.com", {
  transports: ["websocket"]
});

// --------------------
// GLOBAL STATE
// --------------------
let username = "";
let currentCircle = "";
let currentDM = "";
let mode = "group"; // group or dm

// --------------------
// INIT
// --------------------
window.onload = () => {
  const savedId = localStorage.getItem("digiId");

  if (savedId) {
    username = savedId;
    socket.emit("register", username);
    showDashboard();
  } else {
    showLogin();
  }

  renderCircles();
};

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

  startGroupChat(circle);
}

function openCircleFromList(circle) {
  startGroupChat(circle);
}

function startGroupChat(circle) {
  mode = "group";
  currentCircle = circle;

  saveCircle(circle);
  localStorage.setItem("circle", circle);

  document.getElementById("messages").innerHTML = "";

  showChat();

  socket.emit("joinCircle", circle);
}

// --------------------
// START DM
// --------------------
function startDM() {
  const target = prompt("Enter username to message:");

  if (!target || target === username) return;

  mode = "dm";
  currentDM = target;

  document.getElementById("messages").innerHTML = "";

  showChat();
}

// --------------------
// SEND MESSAGE
// --------------------
function send() {
  const input = document.getElementById("msg");
  const text = input.value.trim();

  if (!text) return;

  if (mode === "group") {
    socket.emit("message", {
      circle: currentCircle,
      text,
      username
    });
  }

  if (mode === "dm") {
    socket.emit("dm", {
      to: currentDM,
      text,
      username
    });
  }

  input.value = "";
}

// --------------------
// DISPLAY MESSAGE
// --------------------
function displayMessage(data) {
  const messages = document.getElementById("messages");

  const div = document.createElement("div");
  div.classList.add("msg");

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
// RECEIVE GROUP
// --------------------
socket.on("message", (data) => {
  if (mode !== "group") return;
  displayMessage(data);
});

// --------------------
// RECEIVE DM
// --------------------
socket.on("dm", (data) => {
  if (mode !== "dm") return;

  if (data.username !== currentDM && data.to !== currentDM) return;

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
}// RENDER CIRCLE LIST
// --------------------
function renderCircles() {
  const dashboard = document.getElementById("dashboard");

  // remove old list if exists
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
// RECEIVE MESSAGE
// --------------------
socket.on("message", (data) => {
  const messages = document.getElementById("messages");

  const div = document.createElement("div");
  div.classList.add("msg");

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
});

// --------------------
// SOCKET CONNECT
// --------------------
socket.on("connect", () => {
  console.log("CONNECTED:", socket.id);

  if (currentCircle) {
    socket.emit("joinCircle", currentCircle);
  }
});


// ensure buttons work on mobile
window.addEventListener("load", () => {
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
});

function logout() {
  localStorage.clear();
  location.reload();
}
