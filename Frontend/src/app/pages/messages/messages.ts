import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TopBarComponent } from '../../components/common/top-bar/top-bar.component';
import { ConversationListComponent } from '../../components/messages/conversation-list/conversation-list.component';
import { ChatHeaderComponent } from '../../components/messages/chat-header/chat-header.component';
import { ChatMessagesComponent } from '../../components/messages/chat-messages/chat-messages.component';
import { MessageInputComponent } from '../../components/messages/message-input/message-input.component';
import { CreateOfferModalComponent } from '../../components/messages/create-offer-modal/create-offer-modal.component';
import { Conversation, ChatMessage, ChatContact } from '../../models/message.model';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';
import { OfferService } from '../../services/offer.service';
import { ProfileService } from '../../services/profile.service';
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
    CreateOfferModalComponent,
  ],
  templateUrl: './messages.html',
  styleUrls: ['./messages.css'],
})
export class MessagesComponent implements OnInit, OnDestroy {
  private readonly chatService = inject(ChatService);
  private readonly authService = inject(AuthService);
  private readonly offerService = inject(OfferService);
  private readonly profileService = inject(ProfileService);
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);
  private subscriptions: Subscription[] = [];

  conversations: Conversation[] = [];
  activeConversation: Conversation | null = null;
  messages: ChatMessage[] = [];
  loading = true;

  // Getter so it always reads the fresh DB user ID after auth resolves
  get currentUserId(): string {
    return this.authService.getUserId() || '';
  }

  // Offer modal state
  showOfferModal = false;
  recipientHourlyRate = 0;

  ngOnInit(): void {
    // Connect (no-op with Supabase, kept for API compatibility)
    this.chatService.connect();

    // Load conversations
    this.loadConversations();

    // Listen for real-time messages
    this.subscriptions.push(
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

    // Listen for offer status updates (real-time)
    this.subscriptions.push(
      this.chatService.onOfferUpdated$.subscribe((data) => {
        // Update the offer status on matching messages
        this.messages = this.messages.map((m) => {
          if (m.offer && m.offer.id === data.offerId) {
            return {
              ...m,
              offer: {
                ...m.offer,
                status: data.status as
                  | 'pending'
                  | 'accepted'
                  | 'declined'
                  | 'cancelled'
                  | 'in_progress'
                  | 'completed',
              },
            };
          }
          return m;
        });
        this.cdr.detectChanges();
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
    this.chatService.disconnect();
  }

  loadConversations(): void {
    this.loading = true;
    this.chatService.getConversations().subscribe({
      next: (res) => {
        console.log('Conversations loaded:', res);
        this.conversations = res.conversations;
        this.loading = false;

        // Auto-select conversation from query param (deep-link from bookings)
        const qp = this.route.snapshot.queryParamMap;
        const convId = qp.get('conversationId');
        if (convId) {
          const target = this.conversations.find((c) => c.id === Number(convId));
          if (target) {
            this.onConversationSelected(target);
          }
        }

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

    // Subscribe to real-time events for this conversation
    this.chatService.subscribeToConversation(conv.id);

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

    // Show the message instantly while it saves in the background
    const pendingId = -Date.now();
    const pendingMessage: ChatMessage = {
      id: pendingId,
      conversation_id: this.activeConversation.id,
      sender_id: this.currentUserId,
      content: text,
      created_at: new Date().toISOString(),
    };
    this.messages = [...this.messages, pendingMessage];
    this.updateConversationPreview(pendingMessage);
    this.cdr.detectChanges();

    this.chatService.sendMessage(this.activeConversation.id, text).subscribe({
      next: (res) => {
        // Swap the pending message for the confirmed one from DB
        // Supabase Realtime will also fire — dedup check by ID prevents duplicates
        this.messages = this.messages.filter((m) => m.id !== pendingId);
        if (!this.messages.find((m) => m.id === res.message.id)) {
          this.messages = [...this.messages, res.message];
        }
        this.cdr.detectChanges();
      },
      error: () => {
        // If saving failed, pull the message back out
        this.messages = this.messages.filter((m) => m.id !== pendingId);
        this.cdr.detectChanges();
      },
    });
  }

  onCreateOffer(): void {
    if (!this.activeConversation) return;

    const otherUserId = this.activeConversation.otherUser.id;
    this.profileService.getProfileById(otherUserId).subscribe({
      next: (res) => {
        this.recipientHourlyRate = res.user?.hourly_rate || 0;
        this.showOfferModal = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to fetch recipient profile:', err);
        // Still open modal with rate 0
        this.recipientHourlyRate = 0;
        this.showOfferModal = true;
        this.cdr.detectChanges();
      },
    });
  }

  onSubmitOffer(data: { title: string; hourlyRate: number }): void {
    if (!this.activeConversation) return;

    this.offerService
      .createOffer({
        conversationId: this.activeConversation.id,
        title: data.title,
        hourlyRate: data.hourlyRate,
      })
      .subscribe({
        next: () => {
          this.showOfferModal = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to create offer:', err);
          this.showOfferModal = false;
          this.cdr.detectChanges();
        },
      });
  }

  onSchedule(): void {
    console.log('Schedule clicked');
  }

  onAcceptOffer(offerId: number): void {
    this.offerService.updateOfferStatus(offerId, 'accepted').subscribe({
      next: () => {
        // Update locally immediately
        this.messages = this.messages.map((m) => {
          if (m.offer && m.offer.id === offerId) {
            return { ...m, offer: { ...m.offer, status: 'accepted' as const } };
          }
          return m;
        });
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to accept offer:', err),
    });
  }

  onDeclineOffer(offerId: number): void {
    this.offerService.updateOfferStatus(offerId, 'declined').subscribe({
      next: () => {
        this.messages = this.messages.map((m) => {
          if (m.offer && m.offer.id === offerId) {
            return { ...m, offer: { ...m.offer, status: 'declined' as const } };
          }
          return m;
        });
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to decline offer:', err),
    });
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
