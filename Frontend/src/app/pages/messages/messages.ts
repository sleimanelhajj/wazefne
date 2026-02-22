import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopBarComponent } from '../../components/common/top-bar/top-bar.component';
import { ConversationListComponent } from '../../components/messages/conversation-list/conversation-list.component';
import { ChatHeaderComponent } from '../../components/messages/chat-header/chat-header.component';
import { ChatMessagesComponent } from '../../components/messages/chat-messages/chat-messages.component';
import { MessageInputComponent } from '../../components/messages/message-input/message-input.component';
import { Conversation, ChatMessage, ChatContact } from '../../models/message.model';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [
    CommonModule,
    TopBarComponent,
    ConversationListComponent,
    ChatHeaderComponent,
    ChatMessagesComponent,
    MessageInputComponent,
  ],
  templateUrl: './messages.html',
  styleUrls: ['./messages.css'],
})
export class MessagesComponent implements OnInit, OnDestroy {
  private readonly chatService = inject(ChatService);
  private readonly authService = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);
  private subs: Subscription[] = [];

  conversations: Conversation[] = [];
  activeConversation: Conversation | null = null;
  messages: ChatMessage[] = [];
  currentUserId: string = '';
  loading = true;

  ngOnInit(): void {
    // Get current user ID
    const userId = this.authService.getUserId();
    this.currentUserId = userId || '';

    // Connect WebSocket
    this.chatService.connect();

    // Load conversations
    this.loadConversations();

    // Listen for real-time messages
    this.subs.push(
      this.chatService.onNewMessage$.subscribe((msg) => {
        // Add to current messages if it belongs to the active conversation
        if (this.activeConversation && msg.conversation_id === this.activeConversation.id) {
          // Avoid duplicates
          if (!this.messages.find((m) => m.id === msg.id)) {
            this.messages = [...this.messages, msg];
          }
        }
        // Update conversation preview
        this.updateConversationPreview(msg);
        this.cdr.detectChanges();
      }),
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
    this.chatService.disconnect();
  }

  loadConversations(): void {
    this.loading = true;
    this.chatService.getConversations().subscribe({
      next: (res) => {
        console.log('Conversations loaded:', res);
        this.conversations = res.conversations;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load conversations:', err);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  get activeContact(): ChatContact | null {
    if (!this.activeConversation) return null;
    const u = this.activeConversation.otherUser;
    return {
      id: u.id,
      avatar: u.avatar,
      name: `${u.firstName} ${u.lastName}`.trim(),
      online: false,
      title: u.title,
    };
  }

  onConversationSelected(conv: Conversation): void {
    console.log('Selected conversation:', conv.id);
    this.activeConversation = conv;
    this.messages = [];
    this.cdr.detectChanges();

    // Load message history
    this.chatService.getMessages(conv.id).subscribe({
      next: (res) => {
        console.log('Loaded messages for conversation:', res.messages.length);
        this.messages = res.messages;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load messages:', err);
      },
    });
  }

  onMessageSent(text: string): void {
    if (!this.activeConversation) return;
    this.chatService.sendMessage(this.activeConversation.id, text);
  }

  onCreateOffer(): void {
    console.log('Create offer clicked');
  }

  onSchedule(): void {
    console.log('Schedule clicked');
  }

  private updateConversationPreview(msg: ChatMessage): void {
    const conv = this.conversations.find((c) => c.id === msg.conversation_id);
    if (conv) {
      conv.lastMessage = msg.content;
      conv.lastMessageTime = msg.created_at;
      conv.lastMessageSenderId = msg.sender_id;
      // Move to top
      this.conversations = [conv, ...this.conversations.filter((c) => c.id !== conv.id)];
    }
  }
}
