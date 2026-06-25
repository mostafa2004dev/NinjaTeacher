const Message = require("./messages.model");
const { Op } = require("sequelize");

// Lazy-require socket to avoid crash if socket not yet initialized
function tryEmitToUser(userId, event, data) {
  try {
    const { emitToUser } = require("../../config/socket");
    emitToUser(userId, event, data);
  } catch (_) {
    // Socket not initialized (tests, early boot) — silently skip
  }
}

async function sendMessage(senderId, senderName, data) {
  const { receiver_id, subject, body, job_id, job_title, type } = data;
  if (!receiver_id || !body) throw new Error("receiver_id and body are required.");

  const msg = await Message.create({
    sender_id: senderId,
    sender_name: senderName,
    receiver_id,
    subject,
    body,
    job_id,
    job_title,
    type: type || "general",
  });

  // Real-time push to receiver
  tryEmitToUser(receiver_id, "new_message", {
    id:          msg.id,
    sender_name: senderName,
    subject,
    body:        body.substring(0, 100),
    type:        msg.type,
    job_title,
    createdAt:   msg.createdAt,
  });

  return msg;
}

async function getMyMessages(userId) {
  return await Message.findAll({
    where: { receiver_id: userId },
    order: [["createdAt", "DESC"]],
  });
}

async function getSentMessages(userId) {
  return await Message.findAll({
    where: { sender_id: userId },
    order: [["createdAt", "DESC"]],
  });
}

async function markMessageRead(messageId, userId) {
  const msg = await Message.findOne({ where: { id: messageId, receiver_id: userId } });
  if (!msg) throw new Error("Message not found.");
  msg.is_read = true;
  await msg.save();
  return msg;
}

async function getUnreadCount(userId) {
  return await Message.count({ where: { receiver_id: userId, is_read: false } });
}

async function deleteMessage(messageId, userId) {
  const msg = await Message.findOne({ where: { id: messageId, receiver_id: userId } });
  if (!msg) throw new Error("Message not found.");
  await msg.destroy();
  return true;
}

module.exports = {
  sendMessage,
  getMyMessages,
  getSentMessages,
  markMessageRead,
  getUnreadCount,
  deleteMessage,
};
