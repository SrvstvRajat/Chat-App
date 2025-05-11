const Chat = require("../models/Chat");
const Message = require("../models/Message");
const User = require("../models/User");
const MessageService = require("../services/message.service");

const allMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("senderId", "name email")
      .populate("recipientId", "name email")
      .populate("chat");

    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

const sendMessage = async (req, res) => {
  const { text, chatId, senderId, recipientId } = req.body;

  if (!text || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  var newMessage = {
    senderId,
    recipientId,
    text,
    chat: chatId,
  };

  try {
    var message = await Message.create(newMessage);

    message = await message.populate("senderId", "name");
    message = await message.populate("recipientId", "name");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.user",
      select: "name  email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

module.exports = {
  allMessages,
  sendMessage,
};
