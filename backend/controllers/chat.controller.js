const Chat = require("../models/Chat");

const accessChat = async (req, res) => {
  const { recipientId, senderId } = req.body;

  if (!recipientId) {
    console.log("RecipientId param not sent with request");
    return res.sendStatus(400);
  }

  var isChat = await Chat.find({
    $and: [
      { user: { $elemMatch: { $eq: senderId } } },
      { user: { $elemMatch: { $eq: recipientId } } },
    ],
  })
    .populate("user", "-password")
    .populate("latestMessage");

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: "sender",
      user: [senderId, recipientId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "user",
        "-password"
      );
      res.status(200).json(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
};

async function getChatById(req, res) {
  try {
    const chat = await Chat.findOne({ _id: req.params.id });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  accessChat,
  getChatById,
};
