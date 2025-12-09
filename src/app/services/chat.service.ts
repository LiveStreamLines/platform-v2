import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, interval } from 'rxjs';
import { switchMap, startWith } from 'rxjs/operators';
import { environment } from '../../environment/environments';
import { AuthService } from './auth.service';

export interface ChatMessage {
  _id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  content: string;
  replyTo?: string;
  replyToMessage?: {
    _id: string;
    content: string;
    senderName: string;
  };
  read: boolean;
  readAt?: string;
  createdAt: string;
}

export interface Conversation {
  conversationId: string;
  userId: string;
  userName: string;
  userEmail: string;
  lastMessage: ChatMessage;
  unreadCount: number;
  status: 'open' | 'closed';
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = `${environment.backend}/api/chat`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const authh = this.authService.getAuthToken();
    return new HttpHeaders({
      'Authorization': authh ? `Bearer ${authh}` : ''
    });
  }

  // Get all conversations
  getConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.apiUrl}/conversations`, {
      headers: this.getHeaders()
    });
  }

  // Get messages with a specific user
  getMessages(userId: string): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.apiUrl}/messages/${userId}`, {
      headers: this.getHeaders()
    });
  }

  // Get messages by conversation ID (for admins to get specific conversation)
  getMessagesByConversationId(conversationId: string): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.apiUrl}/messages/conversation/${conversationId}`, {
      headers: this.getHeaders()
    });
  }

  // Poll messages (auto-refresh every 3 seconds)
  pollMessages(userId: string, conversationId?: string, intervalMs: number = 3000): Observable<ChatMessage[]> {
    return interval(intervalMs).pipe(
      startWith(0),
      switchMap(() => conversationId 
        ? this.getMessagesByConversationId(conversationId)
        : this.getMessages(userId)
      )
    );
  }

  // Send a message
  // For users: receiverId is optional (defaults to 'admin')
  // For admins: receiverId is required (userId to send to)
  sendMessage(content: string, receiverId?: string, replyTo?: string): Observable<ChatMessage> {
    return this.http.post<ChatMessage>(
      `${this.apiUrl}/send`,
      { receiverId, content, replyTo },
      { headers: this.getHeaders() }
    );
  }

  // Update conversation status by conversation ID (admin only)
  updateConversationStatusById(conversationId: string, status: 'open' | 'closed'): Observable<{ message: string; status: string; count: number }> {
    return this.http.put<{ message: string; status: string; count: number }>(
      `${this.apiUrl}/conversation/id/${conversationId}/status`,
      { status },
      { headers: this.getHeaders() }
    );
  }

  // Update conversation status by userId (admin only, legacy support)
  updateConversationStatus(userId: string, status: 'open' | 'closed'): Observable<{ message: string; status: string; count: number }> {
    return this.http.put<{ message: string; status: string; count: number }>(
      `${this.apiUrl}/conversation/${userId}/status`,
      { status },
      { headers: this.getHeaders() }
    );
  }

  // Mark messages as read
  markAsRead(userId: string): Observable<{ message: string; count: number }> {
    return this.http.post<{ message: string; count: number }>(
      `${this.apiUrl}/read/${userId}`,
      {},
      { headers: this.getHeaders() }
    );
  }

  // Delete a message
  deleteMessage(messageId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${messageId}`, {
      headers: this.getHeaders()
    });
  }
}

