import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopBarComponent } from '../../components/common/top-bar/top-bar.component';
import { ConversationListComponent } from '../../components/messages/conversation-list/conversation-list.component';
import { ChatHeaderComponent } from '../../components/messages/chat-header/chat-header.component';
import { ChatMessagesComponent } from '../../components/messages/chat-messages/chat-messages.component';
import { MessageInputComponent } from '../../components/messages/message-input/message-input.component';
import { Conversation, ChatMessage, ChatContact } from '../../models/message.model';

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
export class MessagesComponent {
  conversations: Conversation[] = [
    {
      id: 1,
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      name: 'Fadi N.',
      role: 'Plumber',
      lastMessage: 'I can be there by 5 PM.',
      time: '10m',
      online: true,
      unread: true,
    },
    {
      id: 2,
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      name: 'Sarah K.',
      role: 'Designer',
      lastMessage: 'Here is the revised logo for your review.',
      time: '1d',
      online: false,
      unread: false,
    },
    {
      id: 3,
      avatar: 'https://randomuser.me/api/portraits/men/65.jpg',
      name: 'Karim J.',
      role: 'Butler',
      lastMessage: 'Confirmed for Saturday event.',
      time: '3d',
      online: false,
      unread: false,
    },
    {
      id: 4,
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
      name: 'Nour E.',
      role: 'Cleaner',
      lastMessage: 'Thank you!',
      time: '1w',
      online: false,
      unread: false,
    },
  ];

  activeConversationId = 1;

  chatMessages: Record<number, ChatMessage[]> = {
    1: [
      {
        id: 1,
        conversationId: 1,
        senderId: 'me',
        type: 'text',
        content: 'Hi Fadi, are you available for a sink repair in Hamra this afternoon?',
        time: '1:45 PM',
      },
      {
        id: 2,
        conversationId: 1,
        senderId: 'them',
        type: 'text',
        content:
          'Hello! Yes, I am available. Can you send me a photo of the issue so I can bring the right tools?',
        time: '1:50 PM',
      },
      {
        id: 3,
        conversationId: 1,
        senderId: 'me',
        type: 'image',
        content: 'Sink photo',
        imageUrl:
          'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=300&fit=crop',
        time: '1:55 PM',
      },
      {
        id: 4,
        conversationId: 1,
        senderId: 'them',
        type: 'offer',
        content: '',
        time: '2:00 PM',
        offer: {
          service: 'Sink Repair Service',
          description: 'Includes labor and standard parts replacement.',
          duration: '~1 hour.',
          price: '200,000 LBP',
        },
      },
    ],
    2: [
      {
        id: 1,
        conversationId: 2,
        senderId: 'them',
        type: 'text',
        content: "Hi! I've finished the first draft of your logo. Would you like to take a look?",
        time: '11:30 AM',
      },
      {
        id: 2,
        conversationId: 2,
        senderId: 'me',
        type: 'text',
        content: 'Yes please, send it over!',
        time: '11:45 AM',
      },
      {
        id: 3,
        conversationId: 2,
        senderId: 'them',
        type: 'text',
        content: 'Here is the revised logo for your review.',
        time: '12:00 PM',
      },
    ],
    3: [
      {
        id: 1,
        conversationId: 3,
        senderId: 'me',
        type: 'text',
        content: 'Hi Karim, are you available for a private event this Saturday?',
        time: '9:00 AM',
      },
      {
        id: 2,
        conversationId: 3,
        senderId: 'them',
        type: 'text',
        content: 'Confirmed for Saturday event.',
        time: '9:30 AM',
      },
    ],
    4: [
      {
        id: 1,
        conversationId: 4,
        senderId: 'them',
        type: 'text',
        content: 'The cleaning is done! Let me know if everything looks good.',
        time: '3:00 PM',
      },
      {
        id: 2,
        conversationId: 4,
        senderId: 'me',
        type: 'text',
        content: 'Everything looks great, thank you!',
        time: '3:15 PM',
      },
      {
        id: 3,
        conversationId: 4,
        senderId: 'them',
        type: 'text',
        content: 'Thank you!',
        time: '3:16 PM',
      },
    ],
  };

  contacts: Record<number, ChatContact> = {
    1: {
      id: 1,
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      name: 'Fadi N.',
      online: true,
      responseTime: '< 1hr',
    },
    2: {
      id: 2,
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      name: 'Sarah K.',
      online: false,
      responseTime: '~ 3hrs',
    },
    3: {
      id: 3,
      avatar: 'https://randomuser.me/api/portraits/men/65.jpg',
      name: 'Karim J.',
      online: false,
      responseTime: '~ 1hr',
    },
    4: {
      id: 4,
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
      name: 'Nour E.',
      online: false,
      responseTime: '~ 2hrs',
    },
  };

  get activeContact(): ChatContact | null {
    return this.contacts[this.activeConversationId] || null;
  }

  get activeMessages(): ChatMessage[] {
    return this.chatMessages[this.activeConversationId] || [];
  }

  onConversationSelected(conv: Conversation) {
    this.activeConversationId = conv.id;
  }

  onMessageSent(text: string) {
    const msgs = this.chatMessages[this.activeConversationId];
    if (!msgs) return;

    const newMsg: ChatMessage = {
      id: msgs.length + 1,
      conversationId: this.activeConversationId,
      senderId: 'me',
      type: 'text',
      content: text,
      time: new Date().toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
      }),
    };
    msgs.push(newMsg);

    // Update conversation preview
    const conv = this.conversations.find((c) => c.id === this.activeConversationId);
    if (conv) {
      conv.lastMessage = text;
      conv.time = 'now';
    }
  }

  onCreateOffer() {
    console.log('Create offer clicked');
  }

  onSchedule() {
    console.log('Schedule clicked');
  }
}
