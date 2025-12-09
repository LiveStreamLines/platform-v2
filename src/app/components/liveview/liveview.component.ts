import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../environment/environments';
import { CameraFeedComponent } from '../camera-feed/camera-feed.component';
import { LiveCameraService, LiveCamera } from '../../services/live-camera.service';

@Component({
  selector: 'app-liveview',
  standalone: true,
  imports: [CameraFeedComponent],
  templateUrl: './liveview.component.html',
  styleUrls: ['./liveview.component.css'],
})
export class LiveviewComponent implements OnInit {
  private apiUrl = environment.proxy;

  elevation = 0; // Starts at 0, range [0, 3600]
  azimuth = 0; // Starts at 90, range [0, 180]
  zoom = 1; // Starts at 1, range [0, 10]

  developerTag!: string;
  projectTag!: string;
  cameraId!: string;

  id: string = "";
  loading = true;
  cameraData: LiveCamera | null = null;

  constructor(
    private http: HttpClient,     
    private route: ActivatedRoute, 
    private router: Router,
    private sanitizer: DomSanitizer,
    private liveCameraService: LiveCameraService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.developerTag = params['developerTag'];
      this.projectTag = params['projectTag'];
      this.cameraId = params['cameraId'];
      
      this.loadCameraData();
    });
  }

  loadCameraData() {
    this.loading = true;
    
    // Fetch all cameras and filter by projectTag and cameraId
    this.liveCameraService.getAllLiveCameras().subscribe({
      next: (cameras) => {
        // Find the camera matching projectTag and cameraId
        const camera = cameras.find(c => 
          c.projectTag === this.projectTag && c.id === this.cameraId
        );
        
        if (camera && camera.hikcameraId) {
          this.cameraData = camera;
          this.id = camera.hikcameraId;
          console.log("Camera data loaded:", camera);
          console.log("Hikvision Camera ID:", this.id);
          
          // Load PTZ data after camera data is loaded
          this.getCurrentPTZ();
        } else {
          console.error("Camera not found or missing hikcameraId:", { projectTag: this.projectTag, cameraId: this.cameraId });
        }
        this.loading = false;
      },
      error: (err) => {
        console.error("Error loading camera data:", err);
        this.loading = false;
      }
    });
  }

  getCurrentPTZ(): void {
    const payload = {
      method: "GET",
      url: "/ISAPI/PTZCtrl/channels/1/absoluteEx",
      id: `${this.id}`,
      contentType: "application/xml"
    };

    this.http.post(`${this.apiUrl}`, payload).subscribe({
      next: (response: any) => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(response.data, "text/xml");
        this.elevation = parseFloat(xmlDoc.getElementsByTagName("elevation")[0]?.textContent || "0");
        this.azimuth = parseFloat(xmlDoc.getElementsByTagName("azimuth")[0]?.textContent || "130.39");
        this.zoom = parseFloat(xmlDoc.getElementsByTagName("absoluteZoom")[0]?.textContent || "1");
        console.log(`Fetched PTZ: Ele:${this.elevation}, Azi:${this.azimuth}, Zoom:${this.zoom}`);
      },
      error: (err) => console.error("Error fetching PTZ:", err)
    });
  }
  
  moveLeft(): void {
    this.azimuth = (this.azimuth - 5 + 360) % 360; // Wrap to 355 when reaching 0
    this.updatePTZ();
  }
  
  moveRight(): void {
    this.azimuth = (this.azimuth + 5) % 360; // Wrap to 0 when reaching 355
    this.updatePTZ();
  }

 moveUp(): void {
    this.elevation = Math.max(0, this.elevation - 5); // Move closer to 0 (up)
    this.updatePTZ();
  }

  moveDown(): void {
    this.elevation = Math.min(90, this.elevation + 5); // Move closer to 90 (down)
    this.updatePTZ();
  }

  zoomIn(): void {
    this.zoom = Math.min(25, this.zoom + 1); // Zoom-in up to max
    this.updatePTZ();
  }

  zoomOut(): void {
    this.zoom = Math.max(1, this.zoom - 1); // Zoom-out down to min
    this.updatePTZ();
  }

  resetToStartPosition(): void {
    this.elevation = 0;
    this.azimuth = 0;
    this.zoom = 1;
    this.updatePTZ();
  }

  updatePTZ(): void {
    if (!this.id) {
      console.error('Camera ID not available for PTZ update');
      return;
    }

    const payload = {
      method: "PUT",
      url: "/ISAPI/PTZCtrl/channels/1/absoluteEx",
      id: `${this.id}`,
      contentType: "application/xml",
      body: `<PTZAbsoluteEx><elevation>${this.elevation.toFixed(2)}</elevation><azimuth>${this.azimuth.toFixed(2)}</azimuth><absoluteZoom>${this.zoom}</absoluteZoom><horizontalSpeed>5</horizontalSpeed><verticalSpeed>5</verticalSpeed></PTZAbsoluteEx>`,
    };

    this.http.post(`${this.apiUrl}`, payload).subscribe({
      next: () => {
        console.log(`PTZ updated successfully. Project: ${this.projectTag} id: ${this.id} Url: ${this.apiUrl} Ele:${this.elevation}, Azi:${this.azimuth}, zoom:${this.zoom}`);
        // Refresh PTZ values after update to ensure sync
        setTimeout(() => this.getCurrentPTZ(), 500);
      },
      error: (err) => {
        console.error('Error updating PTZ:', err);
      },
    });
  }
  
  goBack() {
    this.router.navigate([`home/${this.developerTag}/${this.projectTag}/camera-selection`]);
  }
}
