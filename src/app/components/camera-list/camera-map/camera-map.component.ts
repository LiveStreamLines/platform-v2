import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Camera } from '../../../models/camera.model';
import { Project } from '../../../models/project.model';
import { ProjectService } from '../../../services/project.service';
import { CameraService } from '../../../services/camera.service';
import { GoogleMapsModule } from '@angular/google-maps';

@Component({
  selector: 'app-camera-map',
  standalone: true,
  imports: [GoogleMapsModule, CommonModule],
  templateUrl: './camera-map.component.html',
  styleUrl: './camera-map.component.css',
})
export class CameraMapComponent {
  developerTag!: string;
  projectTag!: string;
  cameras: Camera[] = [];
  selectedCamera: Camera | null = null;
  map: google.maps.Map | null = null;
  popupX: number | null = null;
  popupY: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private cameraService: CameraService
  ) {}

  ngOnInit() {
    this.projectTag = this.route.snapshot.paramMap.get('projectTag')!;
    this.developerTag = this.route.snapshot.paramMap.get('developerTag')!;

    this.projectService.getProjectIdByTag(this.projectTag).subscribe({
      next: (projects: Project[]) => {
        const projectId = projects[0]._id;
        this.cameraService.getCamerasByProject(projectId).subscribe({
          next: (cameras) => (this.cameras = cameras),
          error: (err) => console.error('Error fetching cameras:', err),
        });
      },
      error: (err) => console.error('Project not found:', err),
    });

  }


  onMapReady(event: any): void {
    const map = event as google.maps.Map;
    if (map) {
      this.map = map;
      this.map.setMapTypeId(google.maps.MapTypeId.SATELLITE);
    } else {
      console.error('Map instance not found.');
    }
  }

  onMarkerClick(camera: Camera): void {
    this.selectedCamera = camera; // Set the selected camera

    if (!this.map) return;
  
    const projection = this.map.getProjection();
    if (!projection) {
      console.error('Map projection not available.');
      return;
    }

    const mapBounds = this.map.getBounds();
    if (!mapBounds) {
      console.error('Map bounds are not available.');
      return;
    }

    const topRight = projection.fromLatLngToPoint(mapBounds.getNorthEast());
    const bottomLeft = projection.fromLatLngToPoint(mapBounds.getSouthWest());
    const scale = Math.pow(2, this.map.getZoom() ?? 0); // Zoom scale factor
    
    const latLng = new google.maps.LatLng(Number(camera.lat), Number(camera.lng));
    const point = projection.fromLatLngToPoint(latLng);
  
    if (!point) {
      console.error('Projection point calculation failed.');
      return;
    }

    if (point && topRight && bottomLeft) {
       this.popupX = (point.x - bottomLeft.x) * scale;
      this.popupY = (point.y - topRight.y) * scale;
    }
  
    console.log('Popup X:', this.popupX, 'Popup Y:', this.popupY);
    console.log(this.selectedCamera);
  }
  

  closeInfoPopup(): void {
    this.selectedCamera = null;
    this.popupX = null;
    this.popupY = null;
  }
  
  viewCameraDetails(camera: Camera): void {
    this.router.navigate([`/home/${this.developerTag}/${this.projectTag}/${camera.camera}`]);
  }

}
