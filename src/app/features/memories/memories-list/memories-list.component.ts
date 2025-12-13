import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Memory } from '../../../models/customer/memory.model';

@Component({
  selector: 'app-memories-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './memories-list.component.html',
  styleUrl: './memories-list.component.css'
})
export class MemoriesListComponent implements OnInit {
  memories: Memory[] = [];
  isLoading = true;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadMemories();
  }

  loadMemories() {
    this.api.get<Memory[]>('/memories').subscribe({
      next: (memories) => {
        this.memories = memories;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load memories', err);
        this.isLoading = false;
      }
    });
  }
}

