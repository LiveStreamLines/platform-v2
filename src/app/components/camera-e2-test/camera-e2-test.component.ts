import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environment/environments';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';

interface ImageResponse {
  images: string[];
  count: number;
  dateRange: {
    start: string;
    end: string;
  };
  path: string;
  bucket: string;
  autoCalculated: boolean;
  source: string;
}

@Component({
  selector: 'app-camera-e2-test',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule
  ],
  templateUrl: './camera-e2-test.component.html',
  styleUrl: './camera-e2-test.component.css'
})
export class CameraE2TestComponent implements OnInit {
  projectId: string = 'rta';
  cameraId: string = 'camera1';
  day1: string = '';
  time1: string = '';
  day2: string = '';
  time2: string = '';

  images: string[] = [];
  loading: boolean = false;
  error: string = '';
  response: ImageResponse | null = null;

  // For displaying images - we'll need to construct URLs
  // Since images are in E2 bucket, we might need presigned URLs or a proxy
  imageBaseUrl: string = '';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Set default date to today
    const today = new Date();
    const oneHourAgo = new Date(today.getTime() - 60 * 60 * 1000);
    this.day1 = this.formatDate(oneHourAgo);
    this.time1 = this.formatTime(oneHourAgo);
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  formatTime(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}${minutes}${seconds}`;
  }

  loadImages() {
    if (!this.day1 || !this.time1) {
      this.error = 'Please provide day1 and time1';
      return;
    }

    this.loading = true;
    this.error = '';
    this.images = [];
    this.response = null;

    const authToken = this.authService.getAuthToken();
    const headers = new HttpHeaders({
      'Authorization': authToken ? `Bearer ${authToken}` : '',
      'Content-Type': 'application/json'
    });

    const body: any = {
      day1: this.day1,
      time1: this.time1
    };

    if (this.day2 && this.time2) {
      body.day2 = this.day2;
      body.time2 = this.time2;
    }

    const url = `${environment.backend}/api/get-image-e2/${this.projectId}/${this.cameraId}/`;

    this.http.post<ImageResponse>(url, body, { headers }).subscribe({
      next: (response) => {
        this.response = response;
        this.images = response.images || [];
        this.imageBaseUrl = response.path || '';
        this.loading = false;
        console.log('Images loaded:', response);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || err.message || 'Failed to load images';
        console.error('Error loading images:', err);
      }
    });
  }

  // Construct image URL - this will need to be updated based on how you serve images from E2
  // Options:
  // 1. Use presigned URLs (would need backend endpoint to generate them)
  // 2. Use a proxy endpoint that serves images from E2
  // 3. Direct S3 URL if bucket is public (not recommended)
  getImageUrl(imageTimestamp: string): string {
    // For now, return a placeholder or construct URL based on your setup
    // You'll need to implement a way to get the actual image URL from E2 bucket
    // This could be a presigned URL endpoint or a proxy
    return `${environment.images}/api/get-image-e2-proxy/${this.imageBaseUrl}/${imageTimestamp}.jpg`;
    // Or if you have presigned URLs:
    // return `${environment.backend}/api/get-image-e2-presigned/${this.projectId}/${this.cameraId}/${imageTimestamp}`;
  }

  // Format timestamp for display
  formatTimestamp(timestamp: string): string {
    if (timestamp.length === 14) {
      const year = timestamp.slice(0, 4);
      const month = timestamp.slice(4, 6);
      const day = timestamp.slice(6, 8);
      const hour = timestamp.slice(8, 10);
      const minute = timestamp.slice(10, 12);
      const second = timestamp.slice(12, 14);
      return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    }
    return timestamp;
  }
}

