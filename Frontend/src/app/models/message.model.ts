// ── Conversation (from REST API) ─────────────────────
export interface ConversationUser {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string;
  title: string;
}

export interface Conversation {
  id: number;
  otherUser: ConversationUser;
  lastMessage: string;
  lastMessageTime: string;
  lastMessageSenderId?: string | null;
}

// ── Chat message (from REST API / WebSocket) ─────────
export interface ChatMessage {
  id: number;
  conversation_id: number;
  sender_id: string;
  content: string;
  created_at: string;
}

// ── Chat contact (derived from ConversationUser) ─────
export interface ChatContact {
  id: string;
  avatar: string;
  name: string;
  online: boolean;
  title: string;
}
