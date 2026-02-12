export interface Conversation {
  id: number;
  avatar: string;
  name: string;
  role: string;
  lastMessage: string;
  time: string;
  online: boolean;
  unread: boolean;
}

export interface ChatMessage {
  id: number;
  conversationId: number;
  senderId: 'me' | 'them';
  type: 'text' | 'image' | 'offer';
  content: string;
  time: string;
  imageUrl?: string;
  offer?: CustomOffer;
}

export interface CustomOffer {
  service: string;
  description: string;
  duration: string;
  price: string;
}

export interface ChatContact {
  id: number;
  avatar: string;
  name: string;
  online: boolean;
  responseTime: string;
}
