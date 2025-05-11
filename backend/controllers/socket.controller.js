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
        const user = await User.findByIdAndUpdate(u._id.toString(), {
          status: "online",
        });

        onlineUsers.set(user._id.toString(), socket.id);
        userSockets.set(socket.id, user._id.toString());

        socket.emit("login_success", {
          id: user._id,
          status: user.status,
        });

        io.emit("user_status", {
          userId: user._id.toString(),
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

    socket.on("check_user_status", async ({ userId }) => {
      try {
        const isOnline = onlineUsers.has(userId);

        socket.emit("user_status", {
          userId,
          status: isOnline ? "online" : "offline",
        });
      } catch (error) {
        console.error("Status check error:", error);
      }
    });

    socket.on("disconnect", async () => {
      try {
        const userId = userSockets.get(socket.id);

        if (userId) {
          await UserService.updateUserStatus(userId, "offline");

          onlineUsers.delete(userId);
          userSockets.delete(socket.id);
          typingUsers.delete(userId);

          io.emit("user_status", {
            userId,
            status: "offline",
          });
        }

        console.log(`User disconnected: ${socket.id}`);
      } catch (error) {
        console.error("Disconnect error:", error);
      }
    });
  });
}

module.exports = { initialize };
