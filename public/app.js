const socket = io("https://circle-backend-s7dz.onrender.com");

let username = prompt("Enter username:");

if (!username || username.trim() === "") {
  username = "anon";
}

username = username.trim();

let currentCircle = "general";

// join default circle
socket.on("connect", () => {
  socket.emit("joinCircle", currentCircle);
});

// SEND MESSAGE
function send() {
  const input = document.getElementById("msg");
  const text = input.value.trim();

  if (!text) return;

  socket.emit("message", {
    circle: currentCircle,
    text,
    username
  });

  input.value = "";
}

// RECEIVE MESSAGE
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
