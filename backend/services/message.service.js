const Message = require("../models/Message");
const mongoose = require("mongoose");

async function createMessage(senderId, recipientId, text) {
  try {
    const sId =
      typeof senderId === "string"
        ? mongoose.Types.ObjectId(senderId)
        : senderId;
    const rId =
      typeof recipientId === "string"
        ? mongoose.Types.ObjectId(recipientId)
        : recipientId;

    const newMessage = new Message({
      senderId: sId,
      recipientId: rId,
      text,
      timestamp: new Date(),
    });

    await newMessage.save();
    return newMessage;
  } catch (error) {
    throw new Error(`Error creating message: ${error.message}`);
  }
}

async function getRecentMessages(userId, limit = 50) {
  try {
    const id =
      typeof userId === "string" ? mongoose.Types.ObjectId(userId) : userId;

    return await Message.find({
      $or: [{ senderId: id }, { recipientId: id }],
    })
      .sort({ timestamp: -1 })
      .limit(limit)
      .populate("senderId", "name")
      .populate("recipientId", "name")
      .lean();
  } catch (error) {
    throw new Error(`Error fetching recent messages: ${error.message}`);
  }
}

/**
 * Get conversation history between two users
 * @param {string} userId1 - First user ID
 * @param {string} userId2 - Second user ID
 * @param {number} limit - Max number of messages to retrieve (default: 50)
 * @return {Promise<Array>} Array of message objects
 */
async function getConversation(userId1, userId2, limit = 50) {
  try {
    const id1 =
      typeof userId1 === "string" ? mongoose.Types.ObjectId(userId1) : userId1;
    const id2 =
      typeof userId2 === "string" ? mongoose.Types.ObjectId(userId2) : userId2;

    return await Message.find({
      $or: [
        { senderId: id1, recipientId: id2 },
        { senderId: id2, recipientId: id1 },
      ],
    })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
  } catch (error) {
    throw new Error(`Error fetching conversation: ${error.message}`);
  }
}

async function markMessagesAsRead(senderId, recipientId) {
  try {
    const sId =
      typeof senderId === "string"
        ? mongoose.Types.ObjectId(senderId)
        : senderId;
    const rId =
      typeof recipientId === "string"
        ? mongoose.Types.ObjectId(recipientId)
        : recipientId;

    return await Message.updateMany(
      { senderId: sId, recipientId: rId, read: false },
      { $set: { read: true } }
    );
  } catch (error) {
    throw new Error(`Error marking messages as read: ${error.message}`);
  }
}

module.exports = {
  createMessage,
  getRecentMessages,
  getConversation,
  markMessagesAsRead,
};
