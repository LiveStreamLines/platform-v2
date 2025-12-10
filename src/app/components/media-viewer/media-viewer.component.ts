import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MediaService } from '../../services/media.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../environment/environments';

@Component({
  selector: 'app-media-viewer',
  standalone: true,
  imports: [
    CommonModule,
    MatIcon,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './media-viewer.component.html',
  styleUrl: './media-viewer.component.css'
})
export class MediaViewerComponent implements OnInit {
  mediaItems: any[] = [];
  allFiles: any[] = [];
  currentFileIndex: number = 0;
  currentFile: any = null;
  date: string = '';
  service: string = '';
  isLoading: boolean = false;
  serverUrl: string = environment.images + '/media/upload';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private mediaService: MediaService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.date = params['date'];
      this.service = params['service'];
      
      if (this.date && this.service) {
        this.loadMediaForDate();
      }
    });
  }

  loadMediaForDate(): void {
    this.isLoading = true;
    this.mediaService.getmediaRequests().subscribe({
      next: (data) => {
        // Filter media for the specific date and service
        const filteredMedia = data.filter(request => {
          const requestDate = this.parseDateKey(request.date);
          return requestDate === this.date && request.service === this.service;
        });

        // Collect all files from all media items for this date
        this.allFiles = [];
        filteredMedia.forEach(media => {
          if (media.files && media.files.length > 0) {
            media.files.forEach((file: any) => {
              const fileUrl = this.getFileUrl(media, file);
              const originalName = typeof file === 'object' ? file.originalName : (typeof file === 'string' ? file.split('/').pop() || file : 'Unknown');
              const contentType = typeof file === 'object' ? file.contentType : null;
              const fileType = this.getFileType(fileUrl, originalName, contentType);
              
              this.allFiles.push({
                url: fileUrl,
                type: fileType,
                originalName: originalName,
                media: media
              });
            });
          }
        });

        // Set current file to first file
        if (this.allFiles.length > 0) {
          this.currentFileIndex = 0;
          this.currentFile = this.allFiles[0];
        }

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading media:', error);
        this.isLoading = false;
      }
    });
  }

  parseDateKey(dateStr: string): string {
    // Handle YYYYMMDD format (convert to YYYY-MM-DD)
    if (dateStr.length === 8 && !dateStr.includes('-')) {
      const year = dateStr.substring(0, 4);
      const month = dateStr.substring(4, 6);
      const day = dateStr.substring(6, 8);
      return `${year}-${month}-${day}`;
    }
    // Already in YYYY-MM-DD format or other format
    return dateStr;
  }

  getFileUrl(media: any, file: any): string {
    // Handle both old format (string) and new format (object with url)
    if (typeof file === 'object' && file.url) {
      // New format: file object with S3 URL
      return file.url;
    } else if (typeof file === 'string') {
      // Old format: file path string
      if (media.developerTag && media.projectTag) {
        return `${this.serverUrl}/${media.developerTag}/${media.projectTag}/${file}`;
      }
      return file;
    }
    return '';
  }

  getFileType(url: string, originalName?: string, contentType?: string): 'image' | 'video' | 'unknown' {
    // First, try to determine from contentType if available
    if (contentType) {
      if (contentType.startsWith('image/')) {
        return 'image';
      } else if (contentType.startsWith('video/')) {
        return 'video';
      }
    }

    // Extract extension from URL (remove query parameters first)
    let extension = '';
    if (url) {
      const urlWithoutQuery = url.split('?')[0]; // Remove query parameters
      const parts = urlWithoutQuery.toLowerCase().split('.');
      if (parts.length > 1) {
        extension = parts.pop() || '';
      }
    }

    // If no extension from URL, try from originalName
    if (!extension && originalName) {
      const nameParts = originalName.toLowerCase().split('.');
      if (nameParts.length > 1) {
        extension = nameParts.pop() || '';
      }
    }

    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
    const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'm4v'];
    
    if (extension && imageExtensions.includes(extension)) {
      return 'image';
    } else if (extension && videoExtensions.includes(extension)) {
      return 'video';
    }
    
    return 'unknown';
  }

  selectFile(index: number): void {
    if (index >= 0 && index < this.allFiles.length) {
      this.currentFileIndex = index;
      this.currentFile = this.allFiles[index];
    }
  }

  previousFile(): void {
    if (this.currentFileIndex > 0) {
      this.selectFile(this.currentFileIndex - 1);
    }
  }

  nextFile(): void {
    if (this.currentFileIndex < this.allFiles.length - 1) {
      this.selectFile(this.currentFileIndex + 1);
    }
  }

  goBack(): void {
    this.router.navigate(['/media']);
  }

  getSafeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  formatDate(dateStr: string): string {
    if (dateStr.length === 10) {
      const [year, month, day] = dateStr.split('-');
      return `${day}/${month}/${year}`;
    }
    return dateStr;
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.style.display = 'none';
    }
  }
}

