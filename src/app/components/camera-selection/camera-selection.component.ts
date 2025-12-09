import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { LiveCameraService, LiveCamera } from '../../services/live-camera.service';

@Component({
  selector: 'app-camera-selection',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatIconModule],
  template: `
    <div class="header">
      <button (click)="goBack()" class="back-button">← Back</button>
      <h1 class="title">Live View Cameras</h1>
    </div>
    
    <div *ngIf="loading" class="loading-container">
      <p>Loading cameras...</p>
    </div>
    
    <div *ngIf="error" class="error-container">
      <p>{{ error }}</p>
    </div>
    
    <div class="camera-grid" *ngIf="!loading && !error">
      <mat-card class="camera-card" *ngFor="let camera of cameras" (click)="selectCamera(camera)">
        <div class="camera-image-container">
          <img [src]="camera.image" alt="{{ camera.name }}" class="camera-image">
          <div class="camera-overlay">
            <span class="view-text">View Camera</span>
          </div>
        </div>
        <mat-card-content>
          <h2 class="camera-name">{{ camera.name }}</h2>
          <p class="camera-description">{{ camera.description }}</p>
        </mat-card-content>
      </mat-card>
      
      <div *ngIf="cameras.length === 0" class="no-cameras">
        <p>No cameras available for this project.</p>
      </div>
    </div>
  `,
  styles: [`
    .header {
      display: flex;
      align-items: center;
      padding: 20px;
      background: #1a1a1a;
      border-bottom: 1px solid #333;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .title {
      margin: 0;
      margin-left: 20px;
      color: white;
      font-size: 24px;
      font-weight: 500;
    }

    .back-button {
      padding: 8px 16px;
      background: rgb(141, 13, 13);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.2s;
    }

    .back-button:hover {
      background: rgb(180, 17, 17);
    }
    
    .camera-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      padding: 30px;
      max-width: 1400px;
      margin: 0 auto;
    }
    
    .camera-card {
      cursor: pointer;
      transition: all 0.3s ease;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      background: #1a1a1a;
      max-width: 400px;
      margin: 0 auto;
    }
    
    .camera-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    }

    .camera-image-container {
      position: relative;
      overflow: hidden;
      height: 200px;
    }
    
    .camera-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .camera-card:hover .camera-image {
      transform: scale(1.05);
    }

    .camera-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .camera-card:hover .camera-overlay {
      opacity: 1;
    }

    .view-text {
      color: white;
      font-size: 18px;
      font-weight: 500;
      padding: 8px 16px;
      border: 2px solid white;
      border-radius: 4px;
    }

    .camera-name {
      margin: 16px 16px 8px;
      font-size: 20px;
      color: white;
    }

    .camera-description {
      margin: 0 16px 16px;
      color: #cccccc;
      font-size: 14px;
      line-height: 1.5;
    }

    @media (max-width: 1200px) {
      .camera-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 768px) {
      .camera-grid {
        grid-template-columns: 1fr;
      }
    }

    .loading-container, .error-container, .no-cameras {
      padding: 40px;
      text-align: center;
      color: white;
      font-size: 18px;
    }

    .error-container {
      color: #ff6b6b;
    }
  `]
})
export class CameraSelectionComponent implements OnInit {
  developerTag!: string;
  projectTag!: string;
  cameras: LiveCamera[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private liveCameraService: LiveCameraService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.developerTag = params['developerTag'];
      this.projectTag = params['projectTag'];
      this.loadCameras();
    });
  }

  loadCameras() {
    this.loading = true;
    this.error = null;
    
    this.liveCameraService.getAllLiveCameras().subscribe({
      next: (allCameras) => {
        // Filter cameras by projectTag
        this.cameras = allCameras.filter(camera => camera.projectTag === this.projectTag);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading cameras:', err);
        this.error = 'Failed to load cameras. Please try again later.';
        this.loading = false;
      }
    });
  } 

  selectCamera(camera: LiveCamera) {
    const cameraId = camera.id;
    this.router.navigate([`home/${this.developerTag}/${this.projectTag}/liveview/${cameraId}`]);
  }

  goBack() {
    this.router.navigate([`home/${this.developerTag}/${this.projectTag}`]);
  }
} 