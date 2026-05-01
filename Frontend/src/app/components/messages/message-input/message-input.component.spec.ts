import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MessageInputComponent } from './message-input.component';

describe('MessageInputComponent (component test)', () => {
  let fixture: ComponentFixture<MessageInputComponent>;
  let component: MessageInputComponent;
  let sentMessages: string[];
  let offerClickCount: number;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessageInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MessageInputComponent);
    component = fixture.componentInstance;
    sentMessages = [];
    offerClickCount = 0;

    component.messageSent.subscribe((message) => sentMessages.push(message));
    component.createOffer.subscribe(() => offerClickCount++);

    fixture.detectChanges();
  });

  it('does not emit blank messages', () => {
    component.messageText = '   ';

    component.sendMessage();

    expect(sentMessages).toEqual([]);
  });

  it('trims and emits typed messages, then clears the input', () => {
    component.messageText = '  hello there  ';

    component.sendMessage();

    expect(sentMessages).toEqual(['hello there']);
    expect(component.messageText).toBe('');
  });

  it('sends the message when the send button is clicked', () => {
    const input = fixture.debugElement.query(By.css('.msg-input')).nativeElement;
    const sendButton = fixture.debugElement.query(By.css('.send-btn')).nativeElement;

    input.value = 'from the rendered input';
    input.dispatchEvent(new Event('input'));
    sendButton.click();

    expect(sentMessages).toEqual(['from the rendered input']);
  });

  it('emits createOffer when the create offer button is clicked', () => {
    const createOfferButton = fixture.debugElement.query(By.css('.offer-btn')).nativeElement;

    createOfferButton.click();

    expect(offerClickCount).toBe(1);
  });
});
