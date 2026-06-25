const ContactMessage = require("./contact.model");

exports.sendMessage = async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({
      status: "fail",
      message: "All fields are required.",
      errors: {
        name:    !name    ? "Name is required."    : null,
        email:   !email   ? "Email is required."   : null,
        subject: !subject ? "Subject is required." : null,
        message: !message ? "Message is required." : null,
      },
    });
  }
  try {
    await ContactMessage.create({ name, email, subject, message });
    return res.status(201).json({
      status: "success",
      message: "Your message has been sent. We'll get back to you soon!",
    });
  } catch (err) {
    return res.status(500).json({ status: "error", message: "Failed to send message." });
  }
};
