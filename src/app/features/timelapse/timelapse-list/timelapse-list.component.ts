import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { TimeLapseRequest } from '../../../models/customer/timelapse.model';

@Component({
  selector: 'app-timelapse-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './timelapse-list.component.html',
  styleUrl: './timelapse-list.component.css'
})
export class TimelapseListComponent implements OnInit {
  timelapses: TimeLapseRequest[] = [];
  isLoading = true;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadTimelapses();
  }

  loadTimelapses() {
    this.api.get<TimeLapseRequest[]>('/timelapse-requests').subscribe({
      next: (timelapses) => {
        this.timelapses = timelapses;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load time-lapses', err);
        this.isLoading = false;
      }
    });
  }
}

