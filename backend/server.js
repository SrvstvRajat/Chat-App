const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
const socketController = require("./controllers/socket.controller");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.clientURL,
    methods: ["GET", "POST"],
  },
});

app.use("/users", require("./routes/user.routes.js"));
app.use("/messages", require("./routes/message.routes.js"));
app.use("/chats", require("./routes/chat.routes.js"));

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB:", err));

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);
});
socketController.initialize(io);

const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
