import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Memory } from '../../../models/customer/memory.model';

@Component({
  selector: 'app-memory-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './memory-detail.component.html',
  styleUrl: './memory-detail.component.css'
})
export class MemoryDetailComponent implements OnInit {
  memory: Memory | null = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadMemory(id);
    }
  }

  loadMemory(id: string) {
    this.api.get<Memory>(`/memories/${id}`).subscribe({
      next: (memory) => {
        this.memory = memory;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load memory', err);
        this.isLoading = false;
      }
    });
  }
}

