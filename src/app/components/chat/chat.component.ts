import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ChatService, ChatMessage, Conversation } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { UserService } from '../../services/users.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatListModule,
    MatBadgeModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('messageContainer', { static: false }) messageContainer!: ElementRef;
  @ViewChild('messageInput', { static: false }) messageInput!: ElementRef;

  conversations: Conversation[] = [];
  messages: ChatMessage[] = [];
  selectedConversation: Conversation | null = null;
  newMessage: string = '';
  replyToMessage: ChatMessage | null = null;
  isLoading = false;
  isSending = false;
  currentUserId: string | null = null;
  userRole: string | null = null;
  isAdmin: boolean = false;
  showNewConversationPrompt: boolean = false;

  private messageSubscription?: Subscription;

  constructor(
    private chatService: ChatService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.currentUserId = this.authService.getUserId();
    this.userRole = this.authService.getUserRole();
    this.isAdmin = this.userRole === 'Super Admin' || this.userRole === 'Admin';
    
    this.loadConversations();
    
    // For regular users, automatically load their conversation
    if (!this.isAdmin && this.currentUserId) {
      this.selectMyConversation();
    }
  }

  ngOnDestroy() {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }

  loadConversations(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if user is logged in before making API calls
      if (!this.authService.isLoggedIn()) {
        console.error('User not logged in');
        reject();
        return;
      }

      this.isLoading = true;
      this.chatService.getConversations().subscribe({
        next: (conversations) => {
          this.conversations = conversations;
          this.isLoading = false;
          
          // For regular users, auto-select their open conversation if exists
          if (!this.isAdmin && this.currentUserId && conversations.length > 0) {
            // Find the most recent open conversation
            const openConversations = conversations
              .filter(c => c.userId === this.currentUserId && c.status === 'open')
              .sort((a, b) => {
                const aTime = a.lastMessage?.createdAt || a.updatedAt || a.createdAt;
                const bTime = b.lastMessage?.createdAt || b.updatedAt || b.createdAt;
                return new Date(bTime).getTime() - new Date(aTime).getTime();
              });
            
            if (openConversations.length > 0 && !this.selectedConversation) {
              this.selectConversation(openConversations[0]);
            } else if (conversations.some(c => c.userId === this.currentUserId && c.status === 'closed') && !this.selectedConversation) {
              // If only closed conversations exist, show the prompt
              this.showNewConversationPrompt = true;
            }
          }
          resolve();
        },
        error: (error) => {
          console.error('Error loading conversations:', error);
          this.isLoading = false;
          // Don't let errors from chat API log out the user
          // The error is already handled by the interceptor if it's auth-related
          reject(error);
        }
      });
    });
  }

  selectMyConversation() {
    if (!this.currentUserId || !this.authService.isLoggedIn()) return;
    
    // Create a default conversation for the user if none exists
    const existingConversation = this.conversations.find(c => c.userId === this.currentUserId);
    if (existingConversation) {
      // Check if conversation is closed
      if (existingConversation.status === 'closed') {
        this.showNewConversationPrompt = true;
        this.selectedConversation = null;
        this.messages = [];
        return;
      }
      this.selectConversation(existingConversation);
    } else {
      // Create a new conversation entry (but don't load messages yet - wait for user to send first message)
      this.selectedConversation = {
        conversationId: this.currentUserId,
        userId: this.currentUserId,
        userName: this.authService.getUsername() || 'You',
        userEmail: this.authService.getUserEmail() || '',
        lastMessage: {} as ChatMessage,
        unreadCount: 0,
        status: 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.showNewConversationPrompt = false;
    }
  }

  startNewConversation() {
    // Clear the selected conversation and allow user to start fresh
    this.selectedConversation = null;
    this.messages = [];
    this.showNewConversationPrompt = false;
    this.newMessage = '';
    this.replyToMessage = null;
    
    // Stop any polling
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
      this.messageSubscription = undefined;
    }
    
    // Don't create a local conversation object - wait for backend to create it when first message is sent
    // This ensures we get the correct conversation ID from the backend
  }

  selectConversation(conversation: Conversation) {
    // For regular users, check if conversation is closed
    if (!this.isAdmin && conversation.status === 'closed') {
      this.showNewConversationPrompt = true;
      this.selectedConversation = null;
      this.messages = [];
      return;
    }
    
    // Stop previous polling
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
      this.messageSubscription = undefined;
    }
    
    this.selectedConversation = conversation;
    this.replyToMessage = null;
    this.newMessage = '';
    this.showNewConversationPrompt = false;
    
    // Clear messages first to avoid showing old messages
    this.messages = [];

    // Load messages and start polling
    this.loadMessages();
    this.startPolling();
    
    // Mark messages as read
    this.chatService.markAsRead(conversation.userId).subscribe({
      next: () => {
        this.loadConversations().catch(() => {}); // Refresh conversations to update unread count
      }
    });
  }

  loadMessages() {
    if (!this.selectedConversation || !this.authService.isLoggedIn()) return;

    this.isLoading = true;
    
    // For admins, use conversation ID to get the specific conversation
    // For regular users, use userId to get the most recent open conversation
    const messagesObservable = this.isAdmin && this.selectedConversation.conversationId
      ? this.chatService.getMessagesByConversationId(this.selectedConversation.conversationId)
      : this.chatService.getMessages(this.selectedConversation.userId);
    
    messagesObservable.subscribe({
      next: (messages) => {
        this.messages = messages;
        this.isLoading = false;
        this.scrollToBottom();
      },
      error: (error) => {
        console.error('Error loading messages:', error);
        this.isLoading = false;
        // If it's a 401/403, the interceptor will handle logout
        // For other errors, just show empty messages
        if (error.status !== 401 && error.status !== 403) {
          this.messages = [];
        }
      }
    });
  }

  startPolling() {
    if (!this.selectedConversation || !this.authService.isLoggedIn()) return;

    // Poll every 3 seconds
    // For admins, use conversation ID; for users, use userId
    const conversationId = this.isAdmin ? this.selectedConversation.conversationId : undefined;
    this.messageSubscription = this.chatService.pollMessages(
      this.selectedConversation.userId, 
      conversationId,
      3000
    ).subscribe({
      next: (messages) => {
        if (!this.authService.isLoggedIn()) {
          // Stop polling if user logged out
          if (this.messageSubscription) {
            this.messageSubscription.unsubscribe();
          }
          return;
        }
        
        const previousLength = this.messages.length;
        this.messages = messages;
        
        // Scroll to bottom if new messages arrived
        if (messages.length > previousLength) {
          setTimeout(() => this.scrollToBottom(), 100);
        }
        
        // Refresh conversations to update unread counts
        this.loadConversations();
      },
      error: (error) => {
        console.error('Error polling messages:', error);
        // Stop polling on auth errors
        if (error.status === 401 || error.status === 403) {
          if (this.messageSubscription) {
            this.messageSubscription.unsubscribe();
          }
        }
      }
    });
  }

  sendMessage() {
    if (!this.newMessage.trim() || this.isSending || !this.authService.isLoggedIn()) {
      return;
    }

    // For regular users, send to admin (no receiverId needed)
    // For admins, send to the selected conversation's user
    const receiverId = this.isAdmin && this.selectedConversation 
      ? this.selectedConversation.userId 
      : undefined;

    this.isSending = true;
    const content = this.newMessage.trim();
    const replyTo = this.replyToMessage?._id;

    this.chatService.sendMessage(content, receiverId, replyTo).subscribe({
      next: (message) => {
        this.newMessage = '';
        this.replyToMessage = null;
        this.isSending = false;
        
        // Refresh conversations to get the new conversation if one was created
        this.loadConversations().then(() => {
          // For regular users, find and select the most recent open conversation
          if (!this.isAdmin && this.currentUserId) {
            const openConversations = this.conversations
              .filter(c => c.userId === this.currentUserId && c.status === 'open')
              .sort((a, b) => {
                const aTime = new Date(a.updatedAt || a.createdAt).getTime();
                const bTime = new Date(b.updatedAt || b.createdAt).getTime();
                return bTime - aTime; // Most recent first
              });
            
            if (openConversations.length > 0) {
              const newConversation = openConversations[0];
              // Only select if we don't have a conversation selected, or if it's a different conversation
              if (!this.selectedConversation || this.selectedConversation.conversationId !== newConversation.conversationId) {
                this.selectConversation(newConversation);
              } else {
                // Same conversation, just add the message and refresh
                this.messages.push(message);
                this.scrollToBottom();
              }
            } else {
              // No open conversation found, just add the message
              this.messages.push(message);
              this.scrollToBottom();
            }
          } else {
            // For admins, just add the message
            this.messages.push(message);
            this.scrollToBottom();
          }
        }).catch(() => {
          // Error already logged in loadConversations
          // Still add the message to the UI
          this.messages.push(message);
          this.scrollToBottom();
        });
      },
      error: (error) => {
        console.error('Error sending message:', error);
        this.isSending = false;
        
        // Handle closed conversation error (shouldn't happen now, but keep for safety)
        if (error.error?.conversationClosed) {
          this.showNewConversationPrompt = true;
          this.selectedConversation = null;
          this.messages = [];
        }
        // If it's a 401/403, the interceptor will handle logout
      }
    });
  }

  replyTo(msg: ChatMessage) {
    this.replyToMessage = msg;
    this.messageInput?.nativeElement.focus();
  }

  cancelReply() {
    this.replyToMessage = null;
  }

  deleteMessage(messageId: string) {
    if (confirm('Are you sure you want to delete this message?')) {
      this.chatService.deleteMessage(messageId).subscribe({
        next: () => {
          this.messages = this.messages.filter(m => m._id !== messageId);
        },
        error: (error) => {
          console.error('Error deleting message:', error);
        }
      });
    }
  }

  updateConversationStatus(status: 'open' | 'closed') {
    if (!this.selectedConversation || !this.isAdmin) return;

    // Use conversation ID to update the specific conversation
    const conversationId = this.selectedConversation.conversationId;
    this.chatService.updateConversationStatusById(conversationId, status).subscribe({
      next: () => {
        if (this.selectedConversation) {
          this.selectedConversation.status = status;
        }
        this.loadConversations().catch(() => {});
      },
      error: (error) => {
        console.error('Error updating conversation status:', error);
      }
    });
  }

  scrollToBottom() {
    setTimeout(() => {
      if (this.messageContainer) {
        const element = this.messageContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    }, 100);
  }

  isMyMessage(message: ChatMessage): boolean {
    return message.senderId === this.currentUserId;
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
