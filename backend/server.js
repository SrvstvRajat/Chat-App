const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
const socketController = require("./controllers/socket.controller");
require("dotenv").config();
const path = require("path");

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

const __dirname1 = path.dirname(path.resolve());
console.log(__dirname1);
console.log(path.resolve(__dirname1, "client", "build", "index.html"));
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/client/build")));

  app.get("/{*any}", (req, res) =>
    res.sendFile(path.resolve(__dirname1, "client", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running..");
  });
}

const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
