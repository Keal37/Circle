const socket = io("https://circle-backend-s7dz.onrender.com");

let username = "";
let currentCircle = "";
let mode = "group";
let currentDM = "";

// --------------------
// INIT
// --------------------
window.addEventListener("load", () => {
  const saved = localStorage.getItem("digiId");

  if (saved) {
    username = saved;
    socket.emit("register", username);
    showDashboard();
  } else {
    showLogin();
  }

  bindUI();
});

// --------------------
// UI
// --------------------
function showLogin() {
  document.getElementById("login").classList.remove("hidden");
  document.getElementById("dashboard").classList.add("hidden");
  document.querySelector(".chat").classList.add("hidden");
}

function showDashboard() {
  document.getElementById("login").classList.add("hidden");
  document.getElementById("dashboard").classList.remove("hidden");
  document.querySelector(".chat").classList.add("hidden");
}

function showChat() {
  document.getElementById("login").classList.add("hidden");
  document.getElementById("dashboard").classList.add("hidden");
  document.querySelector(".chat").classList.remove("hidden");
}

// --------------------
// LOGIN
// --------------------
function login() {
  const id = document.getElementById("digiId").value.trim();
  if (!id) return;

  username = id;
  localStorage.setItem("digiId", id);

  socket.emit("register", username);

  showDashboard();
}

window.login = login;

// --------------------
// GROUP
// --------------------
function openCircle() {
  const c = document.getElementById("newCircle").value.trim();
  if (!c) return;

  mode = "group";
  currentCircle = c;

  socket.emit("joinCircle", c);

  document.getElementById("messages").innerHTML = "";
  showChat();
}

window.openCircle = openCircle;

// --------------------
// SEND
// --------------------
function send() {
  const input = document.getElementById("msg");
  const text = input.value.trim();

  if (!text) return;

  if (mode === "group") {
    socket.emit("message", {
      circle: currentCircle,
      username,
      text
    });
  }

  if (mode === "dm") {
    socket.emit("dm", {
      to: currentDM,
      username,
      text
    });
  }

  input.value = "";
}

window.send = send;

// --------------------
// RECEIVE GROUP
// --------------------
socket.on("message", (data) => {
  if (mode !== "group") return;
  addMessage(data);
});

// --------------------
// RECEIVE DM
// --------------------
socket.on("dm", (data) => {
  if (mode !== "dm") return;
  addMessage(data);
});

// --------------------
// MESSAGE UI
// --------------------
function addMessage(data) {
  const box = document.getElementById("messages");

  const div = document.createElement("div");
  div.innerHTML = `<b>${data.username}</b>: ${data.text}`;

  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

// --------------------
// UI BINDING (MOBILE SAFE)
// --------------------
function bindUI() {
  const btn = document.getElementById("sendBtn");
  const input = document.getElementById("msg");

  if (btn) btn.addEventListener("click", send);
  if (input) input.addEventListener("keydown", e => {
    if (e.key === "Enter") send();
  });
}

// --------------------
// LOGOUT
// --------------------
function logout() {
  localStorage.clear();
  location.reload();
}

window.logout = logout;
