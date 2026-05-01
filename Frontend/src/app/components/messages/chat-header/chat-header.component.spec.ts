import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ChatHeaderComponent } from './chat-header.component';

describe('ChatHeaderComponent (component test)', () => {
  let fixture: ComponentFixture<ChatHeaderComponent>;
  let component: ChatHeaderComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatHeaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ChatHeaderComponent);
    component = fixture.componentInstance;
  });

  it('does not render a header without a selected contact', () => {
    component.contact = null;
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('.chat-header'))).toBeNull();
  });

  it('renders the selected contact and emits back clicks', () => {
    let clicks = 0;
    component.contact = {
      id: 'provider-1',
      avatar: 'avatar.png',
      name: 'Maya Haddad',
      online: true,
      title: 'Photographer',
    };
    component.showBack = true;
    component.backClicked.subscribe(() => clicks++);
    fixture.detectChanges();

    fixture.debugElement.query(By.css('.back-btn')).nativeElement.click();

    expect(fixture.nativeElement.textContent).toContain('Maya Haddad');
    expect(clicks).toBe(1);
  });
});
