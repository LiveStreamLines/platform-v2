import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CameraService } from '../../../services/camera.service';
import { AuthService } from '../../../services/auth.service';
import { environment } from '../../../../environment/environments';
import { interval } from 'rxjs';


@Component({
  selector: 'app-ecrd',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ecrd.component.html',
  styleUrl: './ecrd.component.css'
})
export class EcrdComponent {
  //@Input() developerId: string = ''; // Passed input for filtering

  loading = true;
  developerId: string = '46acd2f3e22af1628efdea27';
  cameras: any[] = [];
  filteredCameras: any[] = [];

  constructor(
    private cameraService: CameraService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cameraService.getLastPicture().subscribe((data) => {
      this.cameras = data;
      this.filteredCameras = this.cameras.filter(cam => cam.developerId === this.developerId);
      this.loading = false; // Hide loading after data is ready
    });

    interval(1200000).subscribe(() => {
      window.location.reload();
    });
  }

  getImagePath(camera: any): string {
    return `${environment.backend}/media/upload/${camera.developerTag}/${camera.projectTag}/${camera.cameraName}/large/${camera.lastPhoto}`;
  }

  isUpdated(lastPhoto: string): boolean {
    const timeDifference = (new Date().getTime() - new Date(lastPhoto).getTime()) / (1000 * 60);
    return timeDifference < 60;
  }

  formatDate(photo: string): string {
    const year = photo.slice(0, 4);
    const month = photo.slice(4, 6);
    const day = photo.slice(6, 8);
    const hour = photo.slice(8, 10);
    const minute = photo.slice(10, 12);
    const second = photo.slice(12, 14);
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  }

  formatTimeDifference(lastPhoto: string): string {
    const now = new Date().getTime();
    const lastPhotoTime = new Date(lastPhoto).getTime();
    const minutes = Math.floor((now - lastPhotoTime) / (1000 * 60));
    if (minutes < 60) return 'Updated';

    const days = Math.floor(minutes / 1440);
    const hours = Math.floor((minutes % 1440) / 60);
    const mins = minutes % 60;

    const parts = [];
    if (days) parts.push(`${days}d`);
    if (hours) parts.push(`${hours}h`);
    if (mins) parts.push(`${mins}m`);
    return `Not updated (${parts.join(' ')})`;
  }
}
