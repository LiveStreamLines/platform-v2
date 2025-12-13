import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { MediaItem } from '../../../models/customer/media.model';

@Component({
  selector: 'app-media-library',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './media-library.component.html',
  styleUrl: './media-library.component.css'
})
export class MediaLibraryComponent implements OnInit {
  media: MediaItem[] = [];
  isLoading = true;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadMedia();
  }

  loadMedia() {
    this.api.get<MediaItem[]>('/media').subscribe({
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

