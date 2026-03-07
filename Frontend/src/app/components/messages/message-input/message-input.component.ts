import {
  Component,
  Output,
  EventEmitter,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
} from '@angular/core';
import 'emoji-picker-element';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './message-input.component.html',
  styleUrls: ['./message-input.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
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

  onInput(event: Event) {
    this.messageText = (event.target as HTMLInputElement).value;
  }

  onEnter(event: Event) {
    event.preventDefault();
    this.sendMessage();
  }

  onCreateOffer() {
    this.createOffer.emit();
  }

  // --- Emoji Picker Logic ---
  showEmojiPicker = false;

  toggleEmojiPicker(event: Event) {
    event.stopPropagation();
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  onEmojiSelect(event: any) {
    if (event.detail && event.detail.unicode) {
      this.messageText += event.detail.unicode;
    }
  }

  @HostListener('document:click')
  clickout() {
    this.closeEmojiPicker();
  }

  // Close picker if user clicks outside
  closeEmojiPicker() {
    this.showEmojiPicker = false;
  }
}
