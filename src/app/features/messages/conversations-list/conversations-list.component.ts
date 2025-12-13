import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { MessageThread } from '../../../models/customer/message.model';

@Component({
  selector: 'app-conversations-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './conversations-list.component.html',
  styleUrl: './conversations-list.component.css'
})
export class ConversationsListComponent implements OnInit {
  conversations: MessageThread[] = [];
  isLoading = true;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadConversations();
  }

  loadConversations() {
    this.api.get<MessageThread[]>('/threads').subscribe({
      next: (conversations) => {
        this.conversations = conversations;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load conversations', err);
        this.isLoading = false;
      }
    });
  }
}

