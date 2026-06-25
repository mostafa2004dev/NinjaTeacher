// notifications.controller.js — أُعيدت كتابته بعد تلف RAR، متوافقة مع routes + service
const svc = require("./notifications.service");

exports.getMyNotifications = async (req, res) => {
  try {
    const data = await svc.getTeacherNotifications(req.user.Teacher_ID);
    return res.status(200).json({ status: "success", data });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const count = await svc.getUnreadCount(req.user.Teacher_ID);
    return res.status(200).json({ status: "success", data: { count } });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const data = await svc.markAsRead(req.params.id, req.user.Teacher_ID);
    return res.status(200).json({ status: "success", data });
  } catch (err) {
    const code = err.message.includes("not found") ? 404 : 400;
    return res.status(code).json({ status: "fail", message: err.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const data = await svc.markAllAsRead(req.user.Teacher_ID);
    return res.status(200).json({ status: "success", data });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    await svc.deleteNotification(req.params.id, req.user.Teacher_ID);
    return res.status(200).json({ status: "success", message: "Notification deleted." });
  } catch (err) {
    const code = err.message.includes("not found") ? 404 : 400;
    return res.status(code).json({ status: "fail", message: err.message });
  }
};
