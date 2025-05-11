const express = require("express");
const router = express.Router();
const messageController = require("../controllers/message.controller");

router.get("/:chatId", messageController.allMessages);

router.post("/", messageController.sendMessage);

module.exports = router;
