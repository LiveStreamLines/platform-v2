import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { MessageThread, Message } from '../../../models/customer/message.model';

@Component({
  selector: 'app-conversation-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './conversation-detail.component.html',
  styleUrl: './conversation-detail.component.css'
})
export class ConversationDetailComponent implements OnInit {
  conversation: MessageThread | null = null;
  messages: Message[] = [];
  newMessage = '';
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadConversation(id);
    }
  }

  loadConversation(id: string) {
    this.api.get<MessageThread>(`/threads/${id}`).subscribe({
      next: (conversation) => {
        this.conversation = conversation;
        this.loadMessages(id);
      },
      error: (err) => {
        console.error('Failed to load conversation', err);
        this.isLoading = false;
      }
    });
  }

  loadMessages(threadId: string) {
    this.api.get<Message[]>(`/threads/${threadId}/messages`).subscribe({
      next: (messages) => {
        this.messages = messages;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load messages', err);
        this.isLoading = false;
      }
    });
  }

  sendMessage() {
    if (this.newMessage.trim() && this.conversation) {
      this.api.post(`/threads/${this.conversation.id}/messages`, { content: this.newMessage }).subscribe({
        next: () => {
          this.newMessage = '';
          this.loadMessages(this.conversation!.id);
        },
        error: (err) => {
          console.error('Failed to send message', err);
        }
      });
    }
  }
}

