import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { SupabaseService } from './supabase.service';
import { ChatService } from './chat.service';

describe('ChatService (HTTP unit test)', () => {
  let service: ChatService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/api/messages`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: SupabaseService,
          useValue: {
            client: {
              channel: () => ({ on: () => ({ on: () => ({ on: () => ({ subscribe: () => ({}) }) }) }) }),
              removeChannel: () => undefined,
            },
          },
        },
      ],
    });

    service = TestBed.inject(ChatService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    service.disconnect();
    httpMock.verify();
  });

  it('loads conversations from the messages API', () => {
    service.getConversations().subscribe((response) => {
      expect(response.success).toBe(true);
      expect(response.conversations).toEqual([]);
    });

    const req = httpMock.expectOne(`${apiUrl}/conversations`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, conversations: [] });
  });

  it('sends a message to a conversation', () => {
    service.sendMessage(12, 'Hello').subscribe((response) => {
      expect(response.message.content).toBe('Hello');
    });

    const req = httpMock.expectOne(`${apiUrl}/conversations/12/messages`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ content: 'Hello' });
    req.flush({
      success: true,
      message: {
        id: 1,
        conversation_id: 12,
        sender_id: 'me',
        content: 'Hello',
        created_at: '2026-05-01T10:00:00.000Z',
      },
    });
  });

  it('creates a conversation with another user', () => {
    service.createConversation('provider-1').subscribe((response) => {
      expect(response.conversation.id).toBe(99);
    });

    const req = httpMock.expectOne(`${apiUrl}/conversations`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ otherUserId: 'provider-1' });
    req.flush({ success: true, conversation: { id: 99 } });
  });
});
