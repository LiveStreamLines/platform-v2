import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { MediaItem } from '../../../models/customer/media.model';

@Component({
  selector: 'app-media-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './media-viewer.component.html',
  styleUrl: './media-viewer.component.css'
})
export class MediaViewerComponent implements OnInit {
  media: MediaItem | null = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadMedia(id);
    }
  }

  loadMedia(id: string) {
    this.api.get<MediaItem>(`/media/${id}`).subscribe({
      next: (media) => {
        this.media = media;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load media', err);
        this.isLoading = false;
      }
    });
  }
}

