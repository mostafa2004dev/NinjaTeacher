// SocketContext.jsx
// Singleton Socket.IO connection, bound to the logged-in user's JWT.
// Provides real-time notification and message invalidation via TanStack Query.
//
// Design constraints observed:
//   - Backend room: "user:<Teacher_ID>"  (emits "notification" and "message" events)
//   - JWT stored in localStorage["userToken"]
//   - TanStack Query cache keys: ["notifications"], ["messages"]
//   - No props drilling; any component can call useSocket()
//
// Safety rules followed:
//   - Single connection per session (singleton pattern)
//   - Listeners removed on cleanup (no memory leaks, no duplicates)
//   - Socket disconnected on logout (token removed)
//   - Reconnection handled by Socket.IO built-in exponential backoff
//   - No existing component modified

import { createContext, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";

const BACKEND_URL = "http://localhost:3000";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const queryClient = useQueryClient();
  const socketRef   = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("userToken");

    // No token = not logged in; skip connection entirely
    if (!token) return;

    // Prevent duplicate connections (e.g. React StrictMode double-invoke)
    if (socketRef.current?.connected) return;

    const socket = io(BACKEND_URL, {
      auth:               { token: `Bearer ${token}` },
      transports:         ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay:  2000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[Socket] connected:", socket.id);
    });

    // ── Real-time notification: invalidate the notifications query ──────────
    // The backend emits the full formatted notification object.
    // TanStack Query refetch delivers it to every useNotifications() consumer.
    socket.on("notification", () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    });

    // ── Real-time message: invalidate the messages query ──────────────────
    socket.on("message", () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    });

    socket.on("disconnect", (reason) => {
      console.log("[Socket] disconnected:", reason);
    });

    socket.on("connect_error", (err) => {
      // Expected in dev when backend is down — log quietly, do not throw
      console.warn("[Socket] connect error:", err.message);
    });

    // Cleanup: disconnect when component unmounts (user navigates away or logs out)
    return () => {
      socket.off("notification");
      socket.off("message");
      socket.disconnect();
      socketRef.current = null;
    };
  }, []); // intentionally run once on mount

  // Expose socket ref for components that want to emit directly
  return (
    <SocketContext.Provider value={socketRef}>
      {children}
    </SocketContext.Provider>
  );
}

// useSocket() — returns the socket ref for direct emit (optional use)
export function useSocket() {
  return useContext(SocketContext);
}

export default SocketProvider;
