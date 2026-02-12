import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './message-input.component.html',
  styleUrls: ['./message-input.component.css'],
})
export class MessageInputComponent {
  @Output() messageSent = new EventEmitter<string>();
  @Output() createOffer = new EventEmitter<void>();

  messageText = '';

  sendMessage() {
    const text = this.messageText.trim();
    if (!text) return;
    this.messageSent.emit(text);
    this.messageText = '';
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  onCreateOffer() {
    this.createOffer.emit();
  }
}
