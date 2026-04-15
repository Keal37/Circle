const socket = io("https://circle-backend-s7dz.onrender.com");

let currentCircle = "";

function joinCircle() {
  currentCircle = document.getElementById("circleInput").value;
  socket.emit("joinCircle", currentCircle);
}

function send() {
  const text = document.getElementById("msg").value;

  socket.emit("message", {
    circle: currentCircle,
    text: text
  });

  document.getElementById("msg").value = "";
}

socket.on("message", (data) => {
  const div = document.createElement("div");
  div.innerText = `[${data.circle}] ${data.text}`;
  document.getElementById("messages").appendChild(div);
});

