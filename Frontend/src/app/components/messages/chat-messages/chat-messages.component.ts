import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  AfterViewChecked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatMessage } from '../../../models/message.model';

@Component({
  selector: 'app-chat-messages',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-messages.component.html',
  styleUrls: ['./chat-messages.component.css'],
})
export class ChatMessagesComponent implements AfterViewChecked {
  @Input() messages: ChatMessage[] = [];
  @Input() currentUserId: string = '';
  @Input() otherUserAvatar: string = '';
  @Output() acceptOffer = new EventEmitter<number>();
  @Output() declineOffer = new EventEmitter<number>();
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  private shouldScroll = true;

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
    }
  }

  scrollToBottom() {
    try {
      this.scrollContainer.nativeElement.scrollTop =
        this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  isMine(msg: ChatMessage): boolean {
    return msg.sender_id === this.currentUserId;
  }

  isOfferMessage(msg: ChatMessage): boolean {
    return !!msg.offer_id && !!msg.offer;
  }

  /** Whether the current user is the recipient of this offer (can accept/decline) */
  canRespondToOffer(msg: ChatMessage): boolean {
    return (
      !!msg.offer && msg.offer.status === 'pending' && msg.offer.recipient_id === this.currentUserId
    );
  }

  getOfferStatusLabel(status: string): string {
    switch (status) {
      case 'accepted':
        return 'Accepted';
      case 'declined':
        return 'Declined';
      default:
        return 'Pending';
    }
  }

  onAcceptOffer(offerId: number) {
    this.acceptOffer.emit(offerId);
  }

  onDeclineOffer(offerId: number) {
    this.declineOffer.emit(offerId);
  }

  formatTime(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }
}
