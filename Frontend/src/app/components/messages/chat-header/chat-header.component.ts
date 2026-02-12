import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatContact } from '../../../models/message.model';

@Component({
  selector: 'app-chat-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-header.component.html',
  styleUrls: ['./chat-header.component.css'],
})
export class ChatHeaderComponent {
  @Input() contact: ChatContact | null = null;
}
