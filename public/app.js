const socket = io("https://circle-backend-s7dz.onrender.com");

let username = prompt("Enter username:");
if (!username) username = "anon";

let currentCircle = "";

function joinCircle() {
  const input = document.getElementById("circleInput");

  currentCircle = input.value;
  socket.emit("joinCircle", currentCircle);

  input.value = "";
}

function send() {
  const text = document.getElementById("msg").value;

  if (!text || !currentCircle) return;

  socket.emit("message", {
    circle: currentCircle,
    text,
    username
  });

  document.getElementById("msg").value = "";
}

socket.on("message", (data) => {
  const div = document.createElement("div");
  div.innerText = `${data.username}: ${data.text}`;
  document.getElementById("messages").appendChild(div);
});
