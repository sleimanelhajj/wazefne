import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { Conversation, ChatMessage } from '../models/message.model';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api/messages';
  private readonly wsUrl = 'http://localhost:3000';

  private socket: Socket | null = null;

  // Observables for real-time events
  private newMessageSubject = new Subject<ChatMessage>();
  onNewMessage$ = this.newMessageSubject.asObservable();

  private typingSubject = new Subject<{ conversationId: number; userId: string }>();
  onTyping$ = this.typingSubject.asObservable();

  private offerUpdatedSubject = new Subject<{
    offerId: number;
    status: string;
    conversationId: number;
  }>();
  onOfferUpdated$ = this.offerUpdatedSubject.asObservable();

  // ── WebSocket lifecycle ──────────────────────────────
  connect(): void {
    if (this.socket?.connected) return;

    const token = localStorage.getItem('auth_token');
    if (!token) return;

    this.socket = io(this.wsUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('Socket.IO connected:', this.socket?.id);
    });

    this.socket.on('new_message', (message: ChatMessage) => {
      this.newMessageSubject.next(message);
    });

    this.socket.on('user_typing', (data: { conversationId: number; userId: string }) => {
      this.typingSubject.next(data);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket.IO disconnected');
    });

    this.socket.on(
      'offer_updated',
      (data: { offerId: number; status: string; conversationId: number }) => {
        this.offerUpdatedSubject.next(data);
      },
    );

    this.socket.on('connect_error', (err) => {
      console.error('Socket.IO connection error:', err.message);
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  // ── Send message via WebSocket ───────────────────────
  sendMessage(conversationId: number, content: string): void {
    this.socket?.emit('send_message', { conversationId, content });
  }

  // ── Typing indicator ────────────────────────────────
  emitTyping(conversationId: number): void {
    this.socket?.emit('typing', { conversationId });
  }

  // ── REST endpoints ──────────────────────────────────
  getConversations(): Observable<{ success: boolean; conversations: Conversation[] }> {
    return this.http.get<{ success: boolean; conversations: Conversation[] }>(
      `${this.apiUrl}/conversations`,
    );
  }

  getMessages(conversationId: number): Observable<{ success: boolean; messages: ChatMessage[] }> {
    return this.http.get<{ success: boolean; messages: ChatMessage[] }>(
      `${this.apiUrl}/conversations/${conversationId}`,
    );
  }

  createConversation(
    otherUserId: string,
  ): Observable<{ success: boolean; conversation: Conversation }> {
    return this.http.post<{ success: boolean; conversation: Conversation }>(
      `${this.apiUrl}/conversations`,
      { otherUserId },
    );
  }
}
