const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
const socketController = require("./controllers/socket.controller");
require("dotenv").config();

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.clientURL,
    methods: ["GET", "POST"],
  },
});

// API Routes
app.use("/users", require("./routes/user.routes.js"));
app.use("/messages", require("./routes/message.routes.js"));
app.use("/chats", require("./routes/chat.routes.js"));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || config.mongoURI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB:", err));

// Handle Socket.io connections
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);
});
socketController.initialize(io);

// Start the server
const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
