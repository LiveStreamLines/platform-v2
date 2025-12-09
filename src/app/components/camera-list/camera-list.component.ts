import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { CameraService } from '../../services/camera.service';
import { ProjectService } from '../../services/project.service';
import { DeveloperService } from '../../services/developer.service';
import { Camera } from '../../models/camera.model';
import { CameraDetailService } from '../../services/camera-detail.service';
import { GoogleMapsModule } from '@angular/google-maps';  // Google Maps module
import { MatTabsModule } from '@angular/material/tabs';
import { CameraViewComponent } from './camera-view/camera-view.component';
import { CameraMapComponent } from './camera-map/camera-map.component';
import { BreadcrumbService } from '../../services/breadcrumb.service';
import { Developer } from '../../models/developer.model';
import { Project } from '../../models/project.model';
import { environment } from '../../../environment/environments';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-camera-list',
  standalone: true,
  imports: [CommonModule, 
            GoogleMapsModule, 
            MatCardModule, 
            MatButtonModule,
            MatTabsModule,
            CameraViewComponent,
            CameraMapComponent
          ],  // Import Sidenav, Header, and GoogleMapsModule
  templateUrl: './camera-list.component.html',
  styleUrls: ['./camera-list.component.css']
})
export class CameraListComponent implements OnInit {

  cameras: Camera[] = [];
  projectId!: string; // Project ID from the route
  developerId!: string;  // Store the developer ID
  developerTag: string = '';
  projectTag: string = '';
  developerName!: string;
  projectName!: string;
  loading: boolean = true;  // Loading state

   // Current active tab index
   activeTab: number = 0;

   userRole: string | null = null;  // Add userRole property

  constructor(
    private router: Router, 
    private cameraDetailService : CameraDetailService,
    private cameraService: CameraService, 
    private projectService: ProjectService,
    private developerService: DeveloperService,
    private breadcrumbService: BreadcrumbService,
    private route: ActivatedRoute, 
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Get user role
    this.userRole = this.authService.getUserRole();
    console.log('Current user role:', this.userRole); // Debug log to see actual role value

    // Get the project ID from the route parameters
    this.developerTag = this.route.snapshot.paramMap.get('developerTag')!;
    this.projectTag = this.route.snapshot.paramMap.get('projectTag')!;
      
      // Get Developer ID by developerTag
      this.developerService.getDeveloperIdByTag(this.developerTag).subscribe({
        next: (developer: Developer[]) => {
          this.developerName = developer[0].developerName;
          // Once we have the developerId, get the project ID
          this.projectService.getProjectIdByTag(this.projectTag).subscribe({
            next: (project: Project[]) => {
              this.projectId = project[0]._id;
              this.projectName = project[0].projectName;
              this.fetchCameras(); // Now that we have the projectId, fetch the cameras
              this.breadcrumbService.setBreadcrumbs([
                { label: 'Home ', url: '/home' },
                { label: `${this.developerName}`, url: `home/${this.developerTag}` },
                { label: `${this.projectName}`, url: `home/${this.developerTag}/${this.projectTag}` },
                { label: `TimeLapse`}
              ]);
            },
            error: (err: any) => {
              console.log(err);
            }
          });         
        },
        error:(err: any) => {
          console.log(err);
        }
    });    
            
  }

  // Function to fetch the list of cameras
  fetchCameras(): void {
    this.cameraService.getCamerasByProject(this.projectId).subscribe({
      next: (data) => {
        this.cameras = data;  // Assign the cameras to the component
          this.cameras.forEach(camera => {
              // For each camera, fetch the first and last pictures
            // this.cameraDetailService.getCameraDetails(this.projectId, camera.camera)
            this.cameraDetailService.getCameraDetails(this.developerTag, this.projectTag,camera.camera) 
            .subscribe(
              {
                  next: (cameraDetail) => {
                    this.loading = false;  // Stop loading once the data is fetched
                    if (!cameraDetail.error) {
                      camera.firstPhoto =  cameraDetail.firstPhoto;
                      camera.lastPhoto = cameraDetail.lastPhoto;     
                      //camera.path = cameraDetail.path;   
                      camera.path = `${environment.images}/media/upload/${this.developerTag}/${this.projectTag}/${camera.camera}/`
                      camera.error = false;
                    } else {
                      camera.error = true;
                    }
                  },
                  error: (err) => {                    
                    console.log ("error");
                  }
              });
            });
       },
         error: (err) => {
        console.error('Error fetching cameras:', err);
        this.loading = false;  // Stop loading in case of error
      }
    });
  }  

  getPictureUrl(camera: string, photo: string): string {
    if (camera && photo) {
      return `${camera}large/${photo}.jpg` ;
    } else {
      return environment.images + '/logos/project/image.png';
    }
  }

  viewCameraDetails(camera: Camera): void {
    this.router.navigate([`/home/${this.developerTag}/${this.projectTag}/${camera.camera}`]);
  }

  // Function to switch tabs (in case we want to handle custom tab switching logic)
  onTabChange(index: number): void {
    this.activeTab = index;
  }

  formatTimestamp(timestamp: string): string {
    if (timestamp) {
    const year = timestamp.substring(0, 4);
    const month = timestamp.substring(4, 6);
    const day = timestamp.substring(6, 8);
    return `${year}-${month}-${day}`;}
    else {
      return 'Null';
    }
  }

  goBack(): void {
  // This method is called when a project is clicked
  this.router.navigate([`/home/${this.developerTag}/${this.projectTag}`]);
  }
}
