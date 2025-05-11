const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat.controller");

router.post("/accessChat", chatController.accessChat);

router.get("/:id", chatController.getChatById);

module.exports = router;
