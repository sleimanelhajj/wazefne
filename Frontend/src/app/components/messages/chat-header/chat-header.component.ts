import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ChatContact } from '../../../models/message.model';

@Component({
  selector: 'app-chat-header',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './chat-header.component.html',
  styleUrls: ['./chat-header.component.css'],
})
export class ChatHeaderComponent {
  @Input() contact: ChatContact | null = null;
  @Input() showBack = false;
  @Output() backClicked = new EventEmitter<void>();
}
