import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatSliderModule } from '@angular/material/slider';
import { MatIconModule } from '@angular/material/icon';

interface CameraPicturesResponse {
  firstPhoto: string;
  lastPhoto: string;
  date1Photos: string[];
  date2Photos: string[];
  path: string;
  error?: string;
}

interface CameraPreviewResponse {
  weeklyImages: string[];
  path: string;
  error?: string;
}

interface VideoResponse {
  message: string;
  videoPath: string;
  error?: string;
}

interface SlideshowResponse {
  images: string[];
  count: number;
  rangeType: string;
  description: string;
  error?: string;
}

@Component({
  selector: 'app-camera-pics-s3-test',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatTabsModule,
    MatListModule,
    MatChipsModule,
    MatSliderModule,
    MatIconModule
  ],
  templateUrl: './camera-pics-s3-test.component.html',
  styleUrl: './camera-pics-s3-test.component.css'
})
export class CameraPicsS3TestComponent implements OnInit {
  // Common inputs
  developerId: string = 'cscec';
  projectId: string = 'rta';
  cameraId: string = 'camera1';
  date1: string = '';
  date2: string = '';

  // Loading states
  loadingPictures: boolean = false;
  loadingPreview: boolean = false;
  loadingVideo: boolean = false;
  loadingSlideshow: boolean = false;

  // Responses
  picturesResponse: CameraPicturesResponse | null = null;
  previewResponse: CameraPreviewResponse | null = null;
  videoResponse: VideoResponse | null = null;
  slideshowResponse: SlideshowResponse | null = null;

  // Selected images for gallery view
  selectedDate1Image: string | null = null;
  selectedDate2Image: string | null = null;

  // Slideshow state
  slideshowImages: string[] = [];
  currentSlideshowIndex: number = 0;
  selectedRangeType: string = '';

  // Errors
  picturesError: string = '';
  previewError: string = '';
  videoError: string = '';
  slideshowError: string = '';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Set default date to today
    const today = new Date();
    this.date1 = this.formatDate(today);
    this.date2 = this.formatDate(today);
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  getAuthHeaders(): HttpHeaders {
    const authToken = this.authService.getAuthToken();
    return new HttpHeaders({
      'Authorization': authToken ? `Bearer ${authToken}` : '',
      'Content-Type': 'application/json'
    });
  }

  // Test 1: Get Camera Pictures
  getCameraPictures() {
    this.loadingPictures = true;
    this.picturesError = '';
    this.picturesResponse = null;

    const url = `${environment.backend}/api/camerapics-s3-test/${this.developerId}/${this.projectId}/${this.cameraId}/pictures/`;
    const body: any = {};
    
    if (this.date1) {
      body.date1 = this.date1;
    }
    if (this.date2) {
      body.date2 = this.date2;
    }

    this.http.post<CameraPicturesResponse>(url, body, { headers: this.getAuthHeaders() }).subscribe({
      next: (response) => {
        this.picturesResponse = response;
        this.loadingPictures = false;
        console.log('Camera Pictures Response:', response);
        
        // Pre-fetch presigned URLs for first and last photos
        if (response.firstPhoto) {
          this.fetchImageUrl(response.firstPhoto);
        }
        if (response.lastPhoto && response.lastPhoto !== response.firstPhoto) {
          this.fetchImageUrl(response.lastPhoto);
        }
        
        // Pre-fetch presigned URLs for date1Photos
        if (response.date1Photos && response.date1Photos.length > 0) {
          response.date1Photos.forEach((photo: string) => {
            this.fetchImageUrl(photo);
          });
          // Set first image as selected by default
          this.selectedDate1Image = response.date1Photos[0];
        }
        
        // Pre-fetch presigned URLs for date2Photos
        if (response.date2Photos && response.date2Photos.length > 0) {
          response.date2Photos.forEach((photo: string) => {
            this.fetchImageUrl(photo);
          });
          // Set first image as selected by default
          this.selectedDate2Image = response.date2Photos[0];
        }
      },
      error: (err) => {
        this.loadingPictures = false;
        this.picturesError = err.error?.error || err.message || 'Failed to load camera pictures';
        console.error('Error loading camera pictures:', err);
      }
    });
  }

  // Test 2: Get Camera Preview (Weekly Images)
  getCameraPreview() {
    this.loadingPreview = true;
    this.previewError = '';
    this.previewResponse = null;

    const url = `${environment.backend}/api/camerapics-s3-test/preview/${this.developerId}/${this.projectId}/${this.cameraId}/`;

    this.http.get<CameraPreviewResponse>(url, { headers: this.getAuthHeaders() }).subscribe({
      next: (response) => {
        this.previewResponse = response;
        this.loadingPreview = false;
        console.log('Camera Preview Response:', response);
        
        // Pre-fetch presigned URLs for weekly images
        if (response.weeklyImages && response.weeklyImages.length > 0) {
          response.weeklyImages.forEach((image: string) => {
            this.fetchImageUrl(image);
          });
        }
      },
      error: (err) => {
        this.loadingPreview = false;
        this.previewError = err.error?.error || err.message || 'Failed to load camera preview';
        console.error('Error loading camera preview:', err);
      }
    });
  }

  // Test 3: Generate Weekly Video
  generateWeeklyVideo() {
    this.loadingVideo = true;
    this.videoError = '';
    this.videoResponse = null;

    const url = `${environment.backend}/api/camerapics-s3-test/preview-video/${this.developerId}/${this.projectId}/${this.cameraId}/`;

    this.http.get<VideoResponse>(url, { headers: this.getAuthHeaders() }).subscribe({
      next: (response) => {
        this.videoResponse = response;
        this.loadingVideo = false;
        console.log('Video Response:', response);
      },
      error: (err) => {
        this.loadingVideo = false;
        this.videoError = err.error?.error || err.message || 'Failed to generate video';
        console.error('Error generating video:', err);
      }
    });
  }


  // Helper methods for displaying images
  // Cache for presigned URLs to avoid multiple requests
  private imageUrlCache: Map<string, string> = new Map();
  // Pre-loaded Image objects for instant display
  private preloadedImages: Map<string, HTMLImageElement> = new Map();
  // Current image URL for direct binding (optimized for speed)
  currentImageUrl: string = '';

  getImageUrl(timestamp: string, path: string): string {
    // Check cache first
    const cacheKey = `${this.developerId}/${this.projectId}/${this.cameraId}/${timestamp}`;
    if (this.imageUrlCache.has(cacheKey)) {
      return this.imageUrlCache.get(cacheKey)!;
    }

    // Return placeholder - will be replaced when presigned URL is fetched
    return '';
  }

  // Fetch presigned URL for an image and pre-load it
  fetchImageUrl(timestamp: string): void {
    const cacheKey = `${this.developerId}/${this.projectId}/${this.cameraId}/${timestamp}`;
    
    // If already cached, skip
    if (this.imageUrlCache.has(cacheKey)) {
      return;
    }

    const url = `${environment.backend}/api/camerapics-s3-test/image/${this.developerId}/${this.projectId}/${this.cameraId}/${timestamp}`;

    this.http.get<{ url: string; key: string; expiresIn: number }>(url, { headers: this.getAuthHeaders() }).subscribe({
      next: (response) => {
        this.imageUrlCache.set(cacheKey, response.url);
        
        // Pre-load the image into browser cache for instant display
        this.preloadImage(response.url, timestamp);
        
        // Only trigger change detection if this is the currently displayed image
        const currentImage = this.getCurrentSlideshowImage();
        if (currentImage === timestamp) {
          this.updateCurrentImageUrl();
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error fetching presigned URL:', err);
        // Set a placeholder or error image
        this.imageUrlCache.set(cacheKey, '');
      }
    });
  }

  // Pre-load image into browser cache for instant display
  private preloadImage(url: string, timestamp: string): void {
    if (this.preloadedImages.has(timestamp)) {
      return; // Already pre-loaded
    }
    
    const img = new Image();
    img.src = url;
    this.preloadedImages.set(timestamp, img);
  }

  // Update current image URL directly (optimized for speed)
  private updateCurrentImageUrl(): void {
    const currentImage = this.getCurrentSlideshowImage();
    if (currentImage) {
      this.currentImageUrl = this.getImageUrlWithFetch(currentImage);
    } else {
      this.currentImageUrl = '';
    }
  }

  // Get image URL with automatic fetching - optimized for instant access
  getImageUrlWithFetch(timestamp: string): string {
    if (!timestamp) return '';
    
    const cacheKey = `${this.developerId}/${this.projectId}/${this.cameraId}/${timestamp}`;
    
    // Return cached URL immediately if available
    if (this.imageUrlCache.has(cacheKey)) {
      return this.imageUrlCache.get(cacheKey) || '';
    }
    
    // If not cached, fetch it (shouldn't happen if pre-fetching worked)
    this.fetchImageUrl(timestamp);
    return '';
  }

  // Get current slideshow image URL directly from cache for instant access
  getCurrentSlideshowImageUrl(): string {
    const currentImage = this.getCurrentSlideshowImage();
    if (!currentImage) return '';
    const url = this.getImageUrlWithFetch(currentImage);
    // Debug: log if URL is not ready
    if (!url && currentImage) {
      const cacheKey = `${this.developerId}/${this.projectId}/${this.cameraId}/${currentImage}`;
      console.log('Image URL not ready for:', currentImage, 'Cache has:', this.imageUrlCache.has(cacheKey));
    }
    return url;
  }

  // Check if image URL is available
  hasImageUrl(timestamp: string): boolean {
    if (!timestamp) return false;
    const cacheKey = `${this.developerId}/${this.projectId}/${this.cameraId}/${timestamp}`;
    return this.imageUrlCache.has(cacheKey) && !!this.imageUrlCache.get(cacheKey);
  }

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

  openVideo() {
    if (this.videoResponse?.videoPath) {
      window.open(this.videoResponse.videoPath, '_blank');
    }
  }

  // Handle image error by hiding the image
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.style.display = 'none';
    }
  }

  // Select image from date1 gallery
  selectDate1Image(timestamp: string): void {
    this.selectedDate1Image = timestamp;
  }

  // Select image from date2 gallery
  selectDate2Image(timestamp: string): void {
    this.selectedDate2Image = timestamp;
  }

  // Slideshow methods
  loadSlideshow(rangeType: string) {
    this.loadingSlideshow = true;
    this.slideshowError = '';
    this.slideshowResponse = null;
    this.slideshowImages = [];
    this.currentSlideshowIndex = 0;
    this.selectedRangeType = rangeType;

    const url = `${environment.backend}/api/camerapics-s3-test/slideshow/${rangeType}/${this.developerId}/${this.projectId}/${this.cameraId}`;

    this.http.get<SlideshowResponse>(url, { headers: this.getAuthHeaders() }).subscribe({
      next: (response) => {
        this.slideshowResponse = response;
        this.slideshowImages = response.images || [];
        this.loadingSlideshow = false;
        this.currentSlideshowIndex = 0;
        
        // Pre-fetch ALL presigned URLs immediately for video-like scrubbing
        // Fetch all images in parallel for instant slider response
        if (this.slideshowImages.length > 0) {
          // Fetch all images immediately for smooth video-like scrubbing
          this.slideshowImages.forEach((image: string) => {
            this.fetchImageUrl(image);
          });
          
          // Update current image URL after initial load
          this.updateCurrentImageUrl();
        }
        
        console.log('Slideshow Response:', response);
      },
      error: (err) => {
        this.loadingSlideshow = false;
        this.slideshowError = err.error?.error || err.message || 'Failed to load slideshow images';
        console.error('Error loading slideshow:', err);
      }
    });
  }


  // Navigate slideshow
  previousImage(): void {
    if (this.currentSlideshowIndex > 0) {
      this.currentSlideshowIndex--;
      this.updateCurrentImageUrl();
      this.onSlideshowIndexChange();
    }
  }

  nextImage(): void {
    if (this.currentSlideshowIndex < this.slideshowImages.length - 1) {
      this.currentSlideshowIndex++;
      this.updateCurrentImageUrl();
      this.onSlideshowIndexChange();
    }
  }

  // Handle slider change - optimized for video-like scrubbing
  onSlideshowSliderChange(event: any): void {
    // Extract the value from the event
    // mat-slider input event can provide value as number or via event.target.value
    let newIndex: number;
    
    if (typeof event === 'number') {
      newIndex = Math.round(event);
    } else if (typeof event === 'string') {
      newIndex = Math.round(parseFloat(event));
    } else if (event?.value !== undefined) {
      newIndex = Math.round(event.value);
    } else if (event?.target?.value !== undefined) {
      newIndex = Math.round(parseFloat(event.target.value));
    } else {
      return;
    }
    
    // Clamp the index to valid range
    newIndex = Math.max(0, Math.min(newIndex, this.slideshowImages.length - 1));
    
    // Update the index if it changed
    if (newIndex !== this.currentSlideshowIndex) {
      this.currentSlideshowIndex = newIndex;
      // Update image URL immediately (synchronous, no async operations)
      this.updateCurrentImageUrl();
      // Force immediate change detection for instant image update (video-like scrubbing)
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    }
  }

  // Handle slideshow index change (for button navigation)
  onSlideshowIndexChange(): void {
    // Force immediate change detection
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  // Handle image load
  onImageLoad(): void {
    // Image loaded successfully, trigger change detection
    this.cdr.detectChanges();
  }

  // Get current slideshow image
  getCurrentSlideshowImage(): string {
    if (this.slideshowImages.length > 0 && this.currentSlideshowIndex < this.slideshowImages.length) {
      return this.slideshowImages[this.currentSlideshowIndex];
    }
    return '';
  }

  // Check if can go previous
  canGoPrevious(): boolean {
    return this.currentSlideshowIndex > 0;
  }

  // Check if can go next
  canGoNext(): boolean {
    return this.currentSlideshowIndex < this.slideshowImages.length - 1;
  }
}

