const socket = io("https://circle-backend-s7dz.onrender.com");

// --------------------
// USER
// --------------------
let username = prompt("Enter username:");

if (!username || username.trim() === "") {
  username = "anon";
}

username = username.trim();

// --------------------
// STATE
// --------------------
let currentCircle = "";

// default circles
let circles = ["general", "dev", "random"];

// --------------------
// INIT HOME
// --------------------
window.onload = () => {
  renderCircles();
};

// --------------------
// RENDER CIRCLES
// --------------------
function renderCircles() {
  const list = document.getElementById("circleList");

  list.innerHTML = "";

  circles.forEach((c) => {
    const div = document.createElement("div");
    div.classList.add("circle-item");
    div.innerText = "#" + c;

    div.onclick = () => joinCircle(c);

    list.appendChild(div);
  });
}

// --------------------
// CREATE CIRCLE
// --------------------
function createCircle() {
  const input = document.getElementById("newCircle");

  const name = input.value.trim().toLowerCase();

  if (!name) return;

  if (!circles.includes(name)) {
    circles.push(name);
  }

  input.value = "";

  renderCircles();
}

// --------------------
// JOIN CIRCLE
// --------------------
function joinCircle(circle) {
  currentCircle = circle;

  socket.emit("joinCircle", circle);

  document.getElementById("home").classList.add("hidden");
  document.getElementById("chat").classList.remove("hidden");

  document.getElementById("currentCircleName").innerText = "#" + circle;
}

// --------------------
// BACK HOME
// --------------------
function backHome() {
  currentCircle = "";

  document.getElementById("chat").classList.add("hidden");
  document.getElementById("home").classList.remove("hidden");
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

  div.innerHTML = `<b>${data.username}</b>: ${data.text}`;

  if (data.username === username) {
    div.style.alignSelf = "flex-end";
    div.style.background = "#3a7afe";
    div.style.color = "white";
  }

  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
});
