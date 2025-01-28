const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static("public")); // Serve static files

// Set to store unique usernames
const users = new Set();

io.on("connection", (socket) => {
  console.log("New client connected ✅");

  socket.on("join", (userName) => {
    if (!userName || userName.trim() === "") {
      socket.emit("chatMessage", {
        userName: "System",
        text: "Invalid username. Please refresh and reconnect with a valid name.",
      });
      return;
    }

    users.add(userName.trim());
    socket.userName = userName.trim();

    io.emit("userJoined", userName.trim());
    io.emit("userList", Array.from(users));
  });

  socket.on("chatMessage", (message) => {
    const sender = message.userName || "Anonymous";
    io.emit("chatMessage", { userName: sender, text: message.text });
  });

  socket.on("disconnect", () => {
    console.log("A client disconnected ❌");

    if (socket.userName) {
      users.delete(socket.userName);
      io.emit("userLeft", socket.userName);
      io.emit("userList", Array.from(users));
    }
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} ✅`);
});
