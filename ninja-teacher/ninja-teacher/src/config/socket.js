const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let io = null;

// ── initSocket ─────────────────────────────────────────────────────────────
// Called once from app.js with the HTTP server instance.
// Sets up Socket.io with JWT authentication on the handshake.
function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Every socket connection must send a valid JWT in the handshake auth object.
  // Frontend: socket = io(URL, { auth: { token: "Bearer <jwt>" } })
  io.use((socket, next) => {
    try {
      const raw = socket.handshake.auth?.token || "";
      const token = raw.startsWith("Bearer ") ? raw.split(" ")[1] : raw;
      if (!token) return next(new Error("Authentication token required."));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId   = decoded.id;
      socket.userRole = decoded.role || "teacher";
      next();
    } catch (err) {
      next(new Error("Invalid or expired token."));
    }
  });

  io.on("connection", (socket) => {
    console.log(`[Socket.io] User ${socket.userId} connected (${socket.id})`);

    socket.join(`user:${socket.userId}`);

    socket.on("ping", () => {
      socket.emit("pong", { time: new Date().toISOString() });
    });

    socket.on("disconnect", (reason) => {
      console.log(`[Socket.io] User ${socket.userId} disconnected: ${reason}`);
    });
  });

  console.log("✅ Socket.io initialized");
  return io;
}

function getIO() {
  if (!io) throw new Error("Socket.io not initialized. Call initSocket() first.");
  return io;
}

// Emit a fully structured notification payload (same shape as GET /notifications items).
function emitToUser(userId, event, data) {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
}

module.exports = { initSocket, getIO, emitToUser };
