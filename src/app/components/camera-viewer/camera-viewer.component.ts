import { Component, OnInit } from '@angular/core';
import { CameraService } from '../../services/camera.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environment/environments';
import { AuthService } from '../../services/auth.service';
import { EcrdComponent } from './ecrd/ecrd.component';


type GroupedCameras = {
  [developer: string]: {
    [project: string]: any[];
  };
};

@Component({
  selector: 'app-camera-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule, EcrdComponent],
  templateUrl: './camera-viewer.component.html',
  styleUrl: './camera-viewer.component.css'
})


export class CameraViewerComponent implements OnInit {

  cameras: any[] = [];
  groupedCameras: GroupedCameras = {};
  accessibleDevelopers: string[] = []; // Example
  accessibleProjects: string[] = []; // Example

  userId: string | null = "";

  isSuperAdmin = true; // Toggle this value for super admin
  showNotWorkingOnly = false;


  constructor(
    private cameraService: CameraService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    
    this.userId = this.authService.getUserId();
    this.isSuperAdmin = this.authService.getUserRole() === 'Super Admin';
    this.accessibleDevelopers = this.authService.getAccessibleDevelopers()!;
    this.accessibleProjects = this.authService.getAccessibleProjects()!;
    console.log (this.isSuperAdmin);

    this.cameraService.getLastPicture().subscribe((data) => {
      this.cameras = data;
      this.groupedCameras = this.groupByDeveloperAndProject(data);
    });
  }

  groupByDeveloperAndProject(cameras: any[]): any {
    

    return cameras.reduce((acc: GroupedCameras, camera) => {
      if (
        !camera.developerId ||
        !this.isSuperAdmin &&
        ((!this.accessibleDevelopers.includes(camera.developerId)) ||
        (!this.accessibleProjects.includes(camera.projectId) && !this.accessibleProjects.includes('all')))
      ) {
        return acc;
      }


      const developer = camera.developer + " (" + camera.developerTag + ")";
      const project = camera.project + " (" + camera.projectTag + ")";
      // Group by developer and project
      acc[developer] = acc[developer] || {}
      acc[developer][project] = acc[developer][project] || [];
      acc[developer][project].push(camera);
      return acc;
    }, {});
  }

  getImagePath(camera: any): string {
    const developer = camera.developerTag;
    const project = camera.projectTag;
    const cameraName = camera.cameraName;
    const lastPhoto = camera.lastPhoto;
    return `${environment.backend}/media/upload/${developer}/${project}/${cameraName}/large/${lastPhoto}`;
  }

  isUpdated(lastPhoto: string): boolean {
    const timeDifference = (new Date().getTime() - new Date(lastPhoto).getTime()) / (1000 * 60);
    return timeDifference < 60; // Less than 1 hour
  }

  formatdate(lastPhoto: string): string {
    const year = lastPhoto.substring(0, 4);
    const month = lastPhoto.substring(4, 6);
    const day = lastPhoto.substring(6, 8);
    const hour = lastPhoto.substring(8,10);
    const minute = lastPhoto.substring(10,12);
    const seconds = lastPhoto.substring(12,14);
    return `${year}-${month}-${day} ${hour}:${minute}:${seconds}`;  
  }

  formatTimeDifference(lastPhoto: string): string {
    const now = new Date().getTime();
    const lastPhotoTime = new Date(lastPhoto).getTime();
    const timeDifferenceInMinutes = Math.round((now - lastPhotoTime) / (1000 * 60));

    if (timeDifferenceInMinutes < 60) {
      return 'Updated';
    }

    const days = Math.floor(timeDifferenceInMinutes / (60 * 24));
    const hours = Math.floor((timeDifferenceInMinutes % (60 * 24)) / 60);
    const minutes = timeDifferenceInMinutes % 60;

    const timeParts = [];
    if (days > 0) timeParts.push(`${days} day${days > 1 ? 's' : ''}`);
    if (hours > 0) timeParts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
    if (minutes > 0) timeParts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);

    return `Not updated (${timeParts.join(' ')})`;

  
  }


}
