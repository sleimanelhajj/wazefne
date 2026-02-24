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
  offer_id?: number | null;
  offer?: {
    id: number;
    title: string;
    hourly_rate: number;
    status: 'pending' | 'accepted' | 'declined';
    sender_id: string;
    recipient_id: string;
  };
}

// ── Chat contact (derived from ConversationUser) ─────
export interface ChatContact {
  id: string;
  avatar: string;
  name: string;
  online: boolean;
  title: string;
}

// ── Offer (from REST API) ────────────────────────────
export interface Offer {
  id: number;
  conversationId: number;
  senderId: string;
  recipientId: string;
  title: string;
  hourlyRate: number;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}
