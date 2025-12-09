import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSliderModule } from '@angular/material/slider';
import { MatTab } from '@angular/material/tabs';
import { MatTabGroup } from '@angular/material/tabs';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { CameraService } from '../../../services/camera.service';
import { CameraDetailService } from '../../../services/camera-detail.service';
import { DeveloperService } from '../../../services/developer.service';
import { ProjectService } from '../../../services/project.service';
import { Project } from '../../../models/project.model';
import { environment } from '../../../../environment/environments';

@Component({
  selector: 'app-camera-view',
  standalone: true,
  imports: [MatSliderModule, FormsModule, MatTab, MatTabGroup, CommonModule, ReactiveFormsModule, MatProgressSpinner],
  templateUrl: './camera-view.component.html',
  styleUrl: './camera-view.component.css'
})
export class CameraViewComponent implements OnInit{

  cameras: any[] = [];
  selectedCameraId: string = '';
  images: string[] = [];  // This will hold image URLs from your API
  imageIndex: number = 0;
  developerTag!: string;
  projectTag!: string;
  developerId!: string;
  projectId!: string;
  path!: string;
  sliderInterval: any;
  videoUrl!: string; // Store video URL
  loadingVideo: boolean = false; // Track video loading state



  constructor(
    private cameraService: CameraService,
    private cameraDetailService: CameraDetailService,
    private developerService: DeveloperService,
    private projectService: ProjectService,
    private route: ActivatedRoute) {}


  ngOnInit() {
     // Get the project ID from the route parameters
     this.developerTag = this.route.snapshot.paramMap.get('developerTag')!;
     this.projectTag = this.route.snapshot.paramMap.get('projectTag')!;
          
       // Get Developer ID by developerTag
        this.projectService.getProjectIdByTag(this.projectTag).subscribe({
          next: (project: Project[]) => {
            this.projectId = project[0]._id
            this.cameraService.getCamerasByProject(this.projectId).subscribe({
                next: (cameras) => {
                  this.cameras = cameras;
                  if (this.cameras.length > 0) {
                    this.selectedCameraId = this.cameras[0].camera; // Set the first camera as selected
                    this.loadCameraImages(this.selectedCameraId); // Load images for the first camera
                  }
                },
                error: (err) => {
                  console.error('Error fetching cameras:', err);
                },
              });        
          }, 
          error: (err: any) => {
            console.error(err);
          }
        });
         
  }

  loadCameraImages(cameraId: string): void {
    //console.log('Number of cameras:', this.cameras.length);
    //console.log(this.cameras);
    this.cameraDetailService.getCameraPreview(this.developerTag, this.projectTag, cameraId).subscribe({
      next: (response) => {
        //this.path = response.path;
        this.path = `${environment.backend}/media/upload/${this.developerTag}/${this.projectTag}/${cameraId}/`
        
        this.images = response.weeklyImages || []; // Update the list of images for the selected camera
        this.preloadImages();
        //this.startSliderMovement();
      },
      error: (err) => {
        console.error('Error fetching camera images:', err);
      },
    });
  }


  preloadImages() {
    this.images.forEach(image => {
      const img = new Image();
      img.src = this.getLargePictureUrl(image);
    });
  }

  getLargePictureUrl(picture: string): string {
    return `${this.path}large/${picture}.jpg`;
  }

  onCameraTabChange(index: number): void {
    console.log('Selected camera tab:', index);

    const selectedCamera = this.cameras[index];
    if (selectedCamera) {
      this.loadCameraImages(selectedCamera.camera);  // Pass the camera ID to load images
    }
  }

  onTrackClick(event: MouseEvent): void {
    const track = (event.target as HTMLElement).getBoundingClientRect();
    const clickPosition = (event.clientX - track.left) / track.width;
    this.imageIndex = Math.round(clickPosition * (this.images.length - 1));
  }
  
  onThumbKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowRight' && this.imageIndex < this.images.length - 1) {
      this.imageIndex++;
    } else if (event.key === 'ArrowLeft' && this.imageIndex > 0) {
      this.imageIndex--;
    }
  }
  
  onThumbDragStart(event: MouseEvent): void {
    const trackElement = (event.target as HTMLElement).closest('.custom-slider')?.querySelector('.slider-track');
    
    if (!trackElement) {
      console.error('Slider track not found.');
      return;
    }
  
    const track = trackElement.getBoundingClientRect();
  
    const mouseMoveListener = (moveEvent: MouseEvent) => {
      const dragPosition = (moveEvent.clientX - track.left) / track.width;
      const newIndex = Math.round(dragPosition * (this.images.length - 1));
      this.imageIndex = Math.min(Math.max(newIndex, 0), this.images.length - 1);
    };
  
    const mouseUpListener = () => {
      window.removeEventListener('mousemove', mouseMoveListener);
      window.removeEventListener('mouseup', mouseUpListener);
    };
  
    window.addEventListener('mousemove', mouseMoveListener);
    window.addEventListener('mouseup', mouseUpListener);
  }
  
  
  getThumbPosition(): number {
    return (this.imageIndex / (this.images.length - 1)) * 100;
  }

  
  navigateToVideo(cameraId: string): void {
    this.loadingVideo = true; // Show spinner
  
    this.loadCameraVideo(cameraId)
      .then(() => {
        this.loadingVideo = false; // Hide spinner
      })
      .catch((error) => {
        this.loadingVideo = false; // Hide spinner
        console.error('Error loading video:', error);
      });
  }

  loadCameraVideo(cameraId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.cameraDetailService.getVideoPreview(this.developerTag, this.projectTag, cameraId).subscribe({
        next: () => {
          const videoUrl = `${environment.backend}/media/upload/${this.developerTag}/${this.projectTag}/${cameraId}/weekly_video.mp4`;
          if (videoUrl) {
            window.open(videoUrl, '_blank'); // Open the video in a new tab
            resolve(); // Indicate success
          } else {
            reject('Video URL not found in response');
          }
        },
        error: (err) => {
          reject(err);
        },
      });
    });
  }
  



}
