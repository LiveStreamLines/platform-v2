import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MediaService } from '../../services/media.service';
import { MatIcon } from '@angular/material/icon';
import { environment } from '../../../environment/environments';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-site-photo',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule, // For mat-spinner
    MatFormFieldModule, // For mat-form-field
    MatInputModule, // For matInput inside form fields
    MatIcon
  ],
  templateUrl: './site-photo.component.html',
  styleUrl: './site-photo.component.css'
})
export class SitePhotoComponent implements OnInit {
  media: any[] = []; 
  isLoading: boolean = false;
  errorMessage: string | null = null;
  serverUrl: string = environment.backend + '/media/upload';
  userRole: string | null = null;
  accessibleProjects: string[] = []; // List of accessible project IDs
  accessibleDevelopers: string[] =[]; // List of accessible devloper IDs

  constructor( private mediaService: MediaService, private authService: AuthService){}

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();
    this.accessibleProjects = this.authService.getAccessibleProjects();  
    this.accessibleDevelopers = this.authService.getAccessibleDevelopers();
    this.fetchMediaRequests();
  }

  fetchMediaRequests(): void {
    this.isLoading = true;
    this.mediaService.getmediaRequests().subscribe({
      next: (data) => {
        this.media = data
        .filter(request => 
          (this.accessibleDevelopers.includes(request.developerId) || this.accessibleDevelopers.includes('all') || this.userRole === 'Super Admin')  &&
          (this.accessibleProjects.includes(request.projectId) || this.accessibleProjects.includes('all') || this.userRole === 'Super Admin') &&
          request.service === 'Site Photography'
        )
        .sort((a, b) => new Date(b.RequestTime).getTime() - new Date(a.RequestTime).getTime()) // Sort by RequestTime desc
        .map((request) => ({
          developerProject: `${request.developer} (${request.project})`,
          date: request.date,
          zipLink: `${this.serverUrl}/${request.developerTag}/${request.projectTag}/${request.files[0]}`
        }));
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load site photography requests.';
        console.error(error);
        this.isLoading = false;
      },
    });
  }

  formatDate(date: string): string {
    // Extract year, month, and day from the YYYYMMDD format
    const year = date.substring(0, 4);
    const month = date.substring(4, 6);
    const day = date.substring(6, 8);

    // Return formatted date in YYYY-MM-DD format
    return `${year}-${month}-${day}`;
  }

  // applyFilter(event: Event): void {
  //   const filterValue = (event.target as HTMLInputElement).value;
  //   this.media.filter = filterValue.trim().toLowerCase();
  // }
}
