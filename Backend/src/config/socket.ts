import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import pool from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

// Map userId -> Set of socket IDs (a user can have multiple tabs)
const onlineUsers = new Map<string, Set<string>>();

let io: Server;

export function initSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // ── Auth middleware ─────────────────────────────────────
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("No token"));

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: string;
        email: string;
      };
      (socket as any).userId = decoded.id;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  // ── Connection handler ─────────────────────────────────
  io.on("connection", (socket: Socket) => {
    const userId = (socket as any).userId as string;
    console.log(`Socket connected: user ${userId} (${socket.id})`);

    // Track online users
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId)!.add(socket.id);

    // Join a room named after the user ID for easy targeting
    socket.join(`user:${userId}`);

    // ── Send message ───────────────────────────────────
    socket.on(
      "send_message",
      async (data: { conversationId: number; content: string }) => {
        try {
          const { conversationId, content } = data;
          if (!content?.trim()) return;

          // Verify this user is part of the conversation
          const convResult = await pool.query(
            `SELECT user1_id, user2_id FROM conversations WHERE id = $1`,
            [conversationId],
          );
          if (convResult.rows.length === 0) return;

          const conv = convResult.rows[0];
          if (conv.user1_id !== userId && conv.user2_id !== userId) return;

          // Insert message
          const msgResult = await pool.query(
            `INSERT INTO messages (conversation_id, sender_id, content)
             VALUES ($1, $2, $3)
             RETURNING id, conversation_id, sender_id, content, created_at`,
            [conversationId, userId, content.trim()],
          );

          // Update conversation timestamp
          await pool.query(
            `UPDATE conversations SET updated_at = NOW() WHERE id = $1`,
            [conversationId],
          );

          const message = msgResult.rows[0];

          // Determine recipient
          const recipientId =
            conv.user1_id === userId
              ? String(conv.user2_id)
              : String(conv.user1_id);

          // Emit to both sender and recipient
          io.to(`user:${userId}`).emit("new_message", message);
          io.to(`user:${recipientId}`).emit("new_message", message);
        } catch (err) {
          console.error("send_message error:", err);
        }
      },
    );

    // ── Typing indicator ───────────────────────────────
    socket.on("typing", async (data: { conversationId: number }) => {
      try {
        const convResult = await pool.query(
          `SELECT user1_id, user2_id FROM conversations WHERE id = $1`,
          [data.conversationId],
        );
        if (convResult.rows.length === 0) return;

        const conv = convResult.rows[0];
        const recipientId =
          conv.user1_id === userId
            ? String(conv.user2_id)
            : String(conv.user1_id);

        io.to(`user:${recipientId}`).emit("user_typing", {
          conversationId: data.conversationId,
          userId,
        });
      } catch (err) {
        console.error("typing error:", err);
      }
    });

    // ── Disconnect ─────────────────────────────────────
    socket.on("disconnect", () => {
      console.log(`Socket disconnected: user ${userId} (${socket.id})`);
      const sockets = onlineUsers.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) onlineUsers.delete(userId);
      }
    });
  });

  return io;
}

export function getIO(): Server {
  return io;
}
