import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BookingTabsComponent } from './booking-tabs.component';

describe('BookingTabsComponent (component test)', () => {
  let fixture: ComponentFixture<BookingTabsComponent>;
  let component: BookingTabsComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingTabsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BookingTabsComponent);
    component = fixture.componentInstance;
  });

  it('renders tab labels and emits selected tab keys', () => {
    const selectedKeys: string[] = [];
    component.tabs = [
      { key: 'active', label: 'Active', count: 2 },
      { key: 'past', label: 'Past', count: 5 },
    ];
    component.activeTab = 'active';
    component.tabChange.subscribe((key) => selectedKeys.push(key));
    fixture.detectChanges();

    const buttons = fixture.debugElement.queryAll(By.css('.tab-btn'));
    buttons[1].nativeElement.click();

    expect(buttons[0].nativeElement.textContent).toContain('Active');
    expect(buttons[0].nativeElement.classList).toContain('active');
    expect(selectedKeys).toEqual(['past']);
  });
});
