import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Conversation } from '../../../models/message.model';

@Component({
  selector: 'app-conversation-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './conversation-list.component.html',
  styleUrls: ['./conversation-list.component.css'],
})
export class ConversationListComponent {
  @Input() conversations: Conversation[] = [];
  @Input() activeConversationId: number | null = null;
  @Output() conversationSelected = new EventEmitter<Conversation>();

  searchQuery = '';

  get filteredConversations(): Conversation[] {
    if (!this.searchQuery.trim()) return this.conversations;
    const q = this.searchQuery.toLowerCase();
    return this.conversations.filter(
      (c) => c.name.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q),
    );
  }

  selectConversation(conv: Conversation) {
    this.conversationSelected.emit(conv);
  }
}
