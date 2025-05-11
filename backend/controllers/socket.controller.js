const User = require("../models/User");
const UserService = require("../services/user.service");
const onlineUsers = new Map();
const userSockets = new Map();
const typingUsers = new Map();

function initialize(io) {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("login", async (u) => {
      try {
        const user = await User.findByIdAndUpdate(
          u._id.toString(),
          {
            status: "online",
          },
          { new: true }
        );

        onlineUsers.set(user._id.toString(), socket.id);
        userSockets.set(socket.id, user._id.toString());
        io.emit("user_status", {
          userId: user._id,
          status: "online",
        });
      } catch (error) {
        console.error("Login error:", error);
        socket.emit("error", { message: "Login failed" });
      }
    });

    socket.on("setup", (userData) => {
      socket.join(userData._id);
      socket.emit("connected");
    });

    socket.on("join chat", (chatId) => {
      socket.join(chatId);
      console.log("User Joined chat Id: ", chatId);
    });

    socket.on("new message", (newMessageRecieved) => {
      var chat = newMessageRecieved.chat;

      console.log(newMessageRecieved);
      if (!chat.user) return console.log("chat.users not defined");
      socket
        .in(newMessageRecieved.recipientId._id)
        .emit("message recieved", newMessageRecieved);
    });

    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

    socket.on("disconnect", async () => {
      try {
        const userId = userSockets.get(socket.id);
        console.log("USER DISCONNECTED");
        const user = await User.findByIdAndUpdate(
          userId,
          {
            status: "offline",
          },
          { new: true }
        );
        console.log("user:", user);

        socket.emit("offline_success", {
          id: user._id,
          status: user.status,
        });
        console.log(user.status);

        io.emit("user_status", {
          userId: user._id,
          status: user.status,
        });
        console.log(`User disconnected: ${socket.id}`);
      } catch (error) {
        console.error("Disconnect error:", error);
      }
    });
    socket.off("setup", async () => {});
  });
}

module.exports = { initialize };
