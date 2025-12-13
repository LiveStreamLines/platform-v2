import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { TimeLapseRequest } from '../../../models/customer/timelapse.model';

@Component({
  selector: 'app-timelapse-viewer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './timelapse-viewer.component.html',
  styleUrl: './timelapse-viewer.component.css'
})
export class TimelapseViewerComponent implements OnInit {
  timelapse: TimeLapseRequest | null = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadTimelapse(id);
    }
  }

  loadTimelapse(id: string) {
    this.api.get<TimeLapseRequest>(`/timelapse-requests/${id}`).subscribe({
      next: (timelapse) => {
        this.timelapse = timelapse;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load time-lapse', err);
        this.isLoading = false;
      }
    });
  }
}

