const User = require("../models/User");
const UserService = require("../services/user.service");
const onlineUsers = new Map(); // userId -> socketId
const userSockets = new Map(); // socketId -> userId
const typingUsers = new Map(); // userId -> { recipientId: boolean }

function initialize(io) {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Handle user login
    socket.on("login", async (u) => {
      try {
        const user = await User.findByIdAndUpdate(u._id.toString(), {
          status: "online",
        });

        onlineUsers.set(user._id.toString(), socket.id);
        userSockets.set(socket.id, user._id.toString());

        // Notify client of successful login
        socket.emit("login_success", {
          id: user._id,
          status: user.status,
        });

        // Notify all users about online status
        io.emit("user_status", {
          userId: user._id.toString(),
          status: "online",
        });

        // Get and send recent messages for the user
        // const recentMessages = await MessageService.getRecentMessages(user._id);
        // socket.emit("recent_messages", recentMessages);

        // Send list of all users
        // const allUsers = await UserService.getAllUsers();
        // socket.emit("user_list", allUsers);
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

    // Handle typing indicator
    // socket.on("typing", async ({ senderId, recipientId, isTyping }) => {
    //   try {
    //     // Get sender's typing status map
    //     let userTypingMap = typingUsers.get(senderId) || {};

    //     // Update typing status for this recipient
    //     userTypingMap[recipientId] = isTyping;
    //     typingUsers.set(senderId, userTypingMap);

    //     // Get the recipient's socket
    //     const recipientSocketId = onlineUsers.get(recipientId);

    //     // If recipient is online, send them the typing indicator
    //     if (recipientSocketId) {
    //       io.to(recipientSocketId).emit("typing_indicator", {
    //         userId: senderId,
    //         isTyping,
    //       });
    //     }
    //   } catch (error) {
    //     console.error("Typing indicator error:", error);
    //   }
    // });

    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

    // Handle check user status
    socket.on("check_user_status", async ({ userId }) => {
      try {
        const isOnline = onlineUsers.has(userId);

        // Send status back to requester
        socket.emit("user_status", {
          userId,
          status: isOnline ? "online" : "offline",
        });
      } catch (error) {
        console.error("Status check error:", error);
      }
    });

    // Handle disconnect
    socket.on("disconnect", async () => {
      try {
        const userId = userSockets.get(socket.id);

        if (userId) {
          // Update user status to offline
          await UserService.updateUserStatus(userId, "offline");

          // Remove user from online users maps
          onlineUsers.delete(userId);
          userSockets.delete(socket.id);
          typingUsers.delete(userId);

          // Notify all users about offline status
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
