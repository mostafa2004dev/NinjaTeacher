const msgService = require("./messages.service");

exports.sendMessage = async (req, res) => {
  try {
    const msg = await msgService.sendMessage(req.user.Teacher_ID, req.user.Name, req.body);
    return res.status(201).json({ status: "success", data: msg });
  } catch (err) {
    return res.status(400).json({ status: "fail", message: err.message });
  }
};

exports.getMyMessages = async (req, res) => {
  try {
    const data = await msgService.getMyMessages(req.user.Teacher_ID);
    return res.status(200).json({ status: "success", data });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

exports.getSentMessages = async (req, res) => {
  try {
    const data = await msgService.getSentMessages(req.user.Teacher_ID);
    return res.status(200).json({ status: "success", data });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

exports.markRead = async (req, res) => {
  try {
    const msg = await msgService.markMessageRead(req.params.id, req.user.Teacher_ID);
    return res.status(200).json({ status: "success", data: msg });
  } catch (err) {
    const code = err.message.includes("not found") ? 404 : 500;
    return res.status(code).json({ status: "fail", message: err.message });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const count = await msgService.getUnreadCount(req.user.Teacher_ID);
    return res.status(200).json({ status: "success", data: { unread_count: count } });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    await msgService.deleteMessage(req.params.id, req.user.Teacher_ID);
    return res.status(200).json({ status: "success", message: "Message deleted." });
  } catch (err) {
    const code = err.message.includes("not found") ? 404 : 500;
    return res.status(code).json({ status: "fail", message: err.message });
  }
};
