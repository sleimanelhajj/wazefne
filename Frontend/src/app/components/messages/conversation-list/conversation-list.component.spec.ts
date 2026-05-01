import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Conversation } from '../../../models/message.model';
import { ConversationListComponent } from './conversation-list.component';

const conversation: Conversation = {
  id: 12,
  otherUser: {
    id: 'provider-1',
    firstName: 'Maya',
    lastName: 'Haddad',
    avatar: '',
    title: 'Photographer',
  },
  lastMessage: 'See you tomorrow',
  lastMessageTime: '2026-05-01T10:00:00.000Z',
};

describe('ConversationListComponent (component test)', () => {
  let fixture: ComponentFixture<ConversationListComponent>;
  let component: ConversationListComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConversationListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConversationListComponent);
    component = fixture.componentInstance;
  });

  it('renders conversations and emits the selected conversation', () => {
    const selected: Conversation[] = [];
    component.conversations = [conversation];
    component.activeConversationId = 12;
    component.conversationSelected.subscribe((conv) => selected.push(conv));
    fixture.detectChanges();

    const item = fixture.debugElement.query(By.css('.conversation-item'));
    item.nativeElement.click();

    expect(item.nativeElement.textContent).toContain('Maya Haddad');
    expect(item.nativeElement.classList).toContain('active');
    expect(selected).toEqual([conversation]);
  });

  it('shows the empty state when there are no conversations', () => {
    component.conversations = [];
    component.loading = false;
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No conversations');
  });
});
