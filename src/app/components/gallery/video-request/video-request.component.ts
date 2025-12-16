import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { VideoRequestService } from '../../../services/video-request.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatIcon } from '@angular/material/icon';
import { MatTableDataSource } from '@angular/material/table';
import { environment } from '../../../../environment/environments';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-video-request',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule, // For mat-table
    MatPaginatorModule, // For mat-paginator
    MatSortModule, // For mat-sort
    MatProgressSpinnerModule, // For mat-spinner
    MatFormFieldModule, // For mat-form-field
    MatInputModule, // For matInput inside form fields
    MatIcon
  ],
  templateUrl: './video-request.component.html',
  styleUrls: ['./video-request.component.css'],
})
export class VideoRequestComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = [
    'developerProject',
    'duration',
    'hours',
    'RequestTime',
    'filteredImageCount',
    'status',
    'videoLink',
  ];
  dataSource = new MatTableDataSource<any>();
  isLoading: boolean = false;
  errorMessage: string | null = null;
  serverUrl: string = environment.images + "/media/upload";
  userRole: string | null = null;
  accessibleProjects: string[] = []; // List of accessible project IDs
  accessibleDevelopers: string[] =[]; // List of accessible devloper IDs
  private progressPollingInterval: any;
  private videoRequestsMap: Map<string, any> = new Map(); // Map to track existing requests by ID
   
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private videoRequestService: VideoRequestService,
    private authService: AuthService  
  ) {}

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();
    this.accessibleProjects = this.authService.getAccessibleProjects();  
    this.accessibleDevelopers = this.authService.getAccessibleDevelopers();
    this.fetchVideoRequests(true); // Initial load
    
    // Poll for progress updates every 2 seconds for in-progress videos
    this.progressPollingInterval = setInterval(() => {
      // Only poll if there are in-progress videos
      const hasInProgress = this.dataSource.data.some(item => 
        item.status === 'starting' || item.status === 'queued' || item.status === 'processing'
      );
      if (hasInProgress) {
        this.fetchVideoRequests(false); // Update only, don't show loading
      }
    }, 2000);
  }

  ngOnDestroy(): void {
    // Clear polling interval when component is destroyed
    if (this.progressPollingInterval) {
      clearInterval(this.progressPollingInterval);
    }
  }

  fetchVideoRequests(showLoading: boolean = true): void {
    if (showLoading) {
      this.isLoading = true;
    }
    this.videoRequestService.getVideoRequests().subscribe({
      next: (data) => {
        const filteredData = data
          .filter(request => 
            (this.accessibleDevelopers.includes(request.developerID) || this.accessibleDevelopers[0] === 'all' || this.userRole === 'Super Admin')  &&
            (this.accessibleProjects.includes(request.projectID) || this.accessibleProjects[0] === 'all' || this.userRole === 'Super Admin')
          )
          .sort((a, b) => new Date(b.RequestTime).getTime() - new Date(a.RequestTime).getTime());

        // Update existing items or add new ones
        const updatedData = filteredData.map((request) => {
          const requestId = request._id || request.id;
          const existingItem = this.videoRequestsMap.get(requestId);
          
          // Create the mapped item
          const mappedItem = {
            id: requestId, // Store ID for tracking
            developerProject: `${request.developer} (${request.project})`,
            camera: request.camera,
            duration: `${this.formatDate(request.startDate)} to ${this.formatDate(request.endDate)}`,
            hours: `${request.startHour} to ${request.endHour}`,
            RequestTime: request.RequestTime,
            filteredImageCount: request.filteredImageCount,
            status: request.status,
            progress: request.progress || 0,
            progressMessage: request.progressMessage || '',
            videoLink: request.status === 'ready' ? `${this.serverUrl}/${request.developerTag}/${request.projectTag}/${request.camera}/videos/video_${request.id}.mp4` : null,
            resolution: request.resolution,
            userName: request.userName || 'Unknown',
            userId: request.userId || ''
          };

          // If item exists and only progress-related fields changed, update only those
          if (existingItem && existingItem.id === requestId) {
            const progressChanged = existingItem.progress !== mappedItem.progress ||
                                   existingItem.progressMessage !== mappedItem.progressMessage ||
                                   existingItem.status !== mappedItem.status ||
                                   existingItem.videoLink !== mappedItem.videoLink;
            
            if (progressChanged) {
              // Update only the changed fields
              existingItem.progress = mappedItem.progress;
              existingItem.progressMessage = mappedItem.progressMessage;
              existingItem.status = mappedItem.status;
              existingItem.videoLink = mappedItem.videoLink;
            }
            return existingItem; // Return existing object reference to prevent re-render
          } else {
            // New item or first load
            this.videoRequestsMap.set(requestId, mappedItem);
            return mappedItem;
          }
        });

        // Remove items that no longer exist
        const currentIds = new Set(filteredData.map(r => r._id || r.id));
        for (const [id, item] of this.videoRequestsMap.entries()) {
          if (!currentIds.has(id)) {
            this.videoRequestsMap.delete(id);
          }
        }

        // Update dataSource only if it's the initial load or structure changed
        if (showLoading || this.dataSource.data.length !== updatedData.length) {
          this.dataSource.data = updatedData;
        } else {
          // For updates, trigger change detection by updating the array reference
          // but keep the same object references for unchanged items
          this.dataSource.data = [...updatedData];
        }

        this.isLoading = false;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load video requests.';
        console.error(error);
        this.isLoading = false;
      },
    });
  }

  // TrackBy function to help Angular identify which items have changed
  trackByRequestId(index: number, item: any): string {
    return item.id || index;
  }

  formatDate(date: string): string {
    // Extract year, month, and day from the YYYYMMDD format
    const year = date.substring(0, 4);
    const month = date.substring(4, 6);
    const day = date.substring(6, 8);
  
    // Return formatted date in YYYY-MM-DD format
    return `${year}-${month}-${day}`;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
