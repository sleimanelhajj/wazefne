import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
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
export class ConversationListComponent implements OnChanges {
  @Input() conversations: Conversation[] = [];
  @Input() activeConversationId: number | null = null;
  @Output() conversationSelected = new EventEmitter<Conversation>();

  searchQuery = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['conversations']) {
      console.log('ConversationList input changed:', this.conversations.length, this.conversations);
    }
  }

  get filteredConversations(): Conversation[] {
    if (!this.searchQuery.trim()) return this.conversations;
    const q = this.searchQuery.toLowerCase();
    return this.conversations.filter(
      (c) =>
        `${c.otherUser.firstName} ${c.otherUser.lastName}`.toLowerCase().includes(q) ||
        c.lastMessage.toLowerCase().includes(q),
    );
  }

  selectConversation(conv: Conversation): void {
    this.conversationSelected.emit(conv);
  }

  getTimeLabel(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'now';
    if (diffMin < 60) return `${diffMin}m`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay}d`;
    return `${Math.floor(diffDay / 7)}w`;
  }
}
