import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DeveloperService } from '../../services/developer.service';
import { ProjectService } from '../../services/project.service';
import { CameraService } from '../../services/camera.service';
import { FilterStateService } from '../../services/filter-state.service';
import { UserService } from '../../services/users.service';
import { MaintenanceService } from '../../services/maintenance.service';
import { Developer } from '../../models/developer.model';
import { Project } from '../../models/project.model';
import { Camera } from '../../models/camera.model';
import { User } from '../../models/user.model';
import { Maintenance, TASK_TYPES } from '../../models/maintenance.model';
import { Router } from '@angular/router';
import { environment } from '../../../environment/environments';
import { TaskCreationDialogComponent } from '../camera-monitor/task-creation-dialog.component';
import { ProjectInfoDialogComponent } from '../camera-monitor/project-info-dialog.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-camera-monitor',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './camera-monitor.component.html',
  styleUrls: ['./camera-monitor.component.css']
})
export class CameraMonitorComponent implements OnInit {
  developers: Developer[] = [];
  projects: Project[] = [];
  allProjects: Project[] = [];
  cameras: Camera[] = [];
  filteredCameras: Camera[] = [];
  selectedDeveloperId: string | null = null;
  selectedProjectId: string | null = null;
  searchText: string = '';
  isLoading = false;
  lastPhotos: any[] = [];
  imageLoaded: { [key: string]: boolean } = {};
  totalCameras: number = 0;
  filteredCamerasCount: number = 0;
  projectStatuses: { [key: string]: string } = {};
  selectedStatus: string | null = null;
  
  // New properties for hierarchical structure
  hierarchicalData: { [developerId: string]: { 
    developer: Developer, 
    projects: { [projectId: string]: { 
      project: Project, 
      cameras: Camera[] 
    } 
  } } } = {};
  statusOptions = [
    { value: null, label: 'All Status' },
    { value: 'new', label: 'New' },
    { value: 'active', label: 'Active' },
    { value: 'on hold', label: 'On Hold' },
    { value: 'finished', label: 'Finished' }
  ];

  // Task creation properties
  taskTypes = TASK_TYPES;
  users: User[] = [];

  private timeUpdateInterval: any;

  selectedUpdateStatus: 'all' | 'updated' | 'not-updated' = 'all';
  updateStatusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'updated', label: 'Updated' },
    { value: 'not-updated', label: 'Not Updated' }
  ];

  sortBy: 'developer' | 'server' = 'developer';

  isSuperAdmin: boolean = false;

  constructor(
    private developerService: DeveloperService,
    private projectService: ProjectService,
    private router: Router,
    private cameraService: CameraService,
    private filterStateService: FilterStateService,
    private userService: UserService,
    private maintenanceService: MaintenanceService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Restore filter state if available
    this.selectedDeveloperId = this.filterStateService.getDeveloperId();
    this.selectedProjectId = this.filterStateService.getProjectId();
    this.loadData();
    this.loadUsers();
    this.checkUserRole();
    
    // Start time update interval
    this.timeUpdateInterval = setInterval(() => {
      this.cdr.detectChanges();
    }, 60000); // Update every minute
  }

  ngOnDestroy(): void {
    // Clear the interval when component is destroyed
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
    }
  }

  loadData() {
    this.isLoading = true;
    this.loadAllProjects();
    this.developerService.getAllDevelopers().subscribe({
      next: (developers: Developer[]) => {
        this.developers = developers;
        this.loadProjects();
      },
      error: (error: any) => {
        console.error('Error loading developers:', error);
        this.isLoading = false;
      }
    });
  }

  loadProjects() {
    if (this.selectedDeveloperId) {
      this.projectService.getProjectsByDeveloper(this.selectedDeveloperId).subscribe({
        next: (projects: Project[]) => {
          this.projects = projects;
          // Store project statuses
          projects.forEach(project => {
            this.projectStatuses[project._id] = project.status;
          });
          this.loadCameras();
        },
        error: (error) => {
          console.error('Error loading projects:', error);
          this.isLoading = false;
        }
      });
    } else {
      this.projects = [];
      this.loadCameras();
    }
  }

  loadAllProjects(): void {
    this.projectService.getAllProjects().subscribe({
      next: (projects: Project[]) => {
        this.allProjects = projects;
        // Store project statuses
        projects.forEach(project => {
          this.projectStatuses[project._id] = project.status;
        });
        // Re-apply filters if cameras are already loaded
        if (this.cameras.length > 0) {
          this.applyFilters();
        }
      },
      error: (error) => {
        console.error('Error loading all projects:', error);
      }
    });
  }

  loadLastPhotos(): void {
    this.cameraService.getLastPicture().subscribe({
      next: (data) => {
        this.lastPhotos = data;
        this.cameras = this.cameras.map(camera => {
          const lastPhoto = this.lastPhotos.find(photo => 
            photo.developerTag === this.getDeveloperTag(camera.developer) && 
            photo.projectTag === this.getProjectTag(camera.project) && 
            photo.cameraName === camera.camera
          );
          return {
            ...camera,
            lastPhoto: lastPhoto?.lastPhoto
          };
        });
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading last photos:', error);
        this.applyFilters();
        this.isLoading = false;
      }
    });
  }

  loadCameras(): void {
    this.isLoading = true;
    if (this.selectedProjectId) {
      this.cameraService.getCamerasByProject(this.selectedProjectId).subscribe({
        next: (data) => {
          this.cameras = data;
          this.totalCameras = data.length;
          this.loadLastPhotos();
        },
        error: (error) => {
          console.error('Error loading cameras:', error);
          this.isLoading = false;
        }
      });
    } else {
      this.loadAllCameras();
    }
  }

  loadAllCameras(): void {
    this.isLoading = true;
    this.cameraService.getAllCameras().subscribe({
      next: (data) => {
        this.cameras = data;
        this.totalCameras = data.length;
        this.loadLastPhotos();
      },
      error: (error) => {
        console.error('Error loading all cameras:', error);
        this.isLoading = false;
      }
    });
  }

  onDeveloperChange(): void {
    this.isLoading = true;
    this.filterStateService.setDeveloperId(this.selectedDeveloperId);
    this.selectedProjectId = null;
    this.filterStateService.setProjectId(null);
    this.projects = [];
    this.cameras = [];
    this.filteredCameras = [];
    this.searchText = ''; // Reset search text
    
    if (this.selectedDeveloperId) {
      this.loadProjects();
    } else {
      this.loadAllCameras();
    }
  }

  onProjectChange(): void {
    this.isLoading = true;
    this.filterStateService.setProjectId(this.selectedProjectId);
    this.cameras = [];
    this.filteredCameras = [];
    this.searchText = ''; // Reset search text
    this.loadCameras();
  }

  onSearchChange(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.applyFilters();
      this.isLoading = false;
    }, 300);
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  onUpdateStatusChange(): void {
    this.applyFilters();
  }

  onSortChange(sortType: 'developer' | 'server'): void {
    this.sortBy = sortType;
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.cameras];

    // Apply developer filter
    if (this.selectedDeveloperId) {
      filtered = filtered.filter(camera => camera.developer === this.selectedDeveloperId);
    }

    // Apply project filter
    if (this.selectedProjectId) {
      filtered = filtered.filter(camera => camera.project === this.selectedProjectId);
    }

    // Apply status filter
    if (this.selectedStatus) {
      filtered = filtered.filter(camera => {
        const projectStatus = this.getProjectStatus(camera.project);
        return projectStatus === this.selectedStatus;
      });
    }

    // Apply update status filter
    if (this.selectedUpdateStatus !== 'all') {
      filtered = filtered.filter(camera => {
        const isUpdated = this.isUpdated(camera.lastPhoto);
        return this.selectedUpdateStatus === 'updated' ? isUpdated : !isUpdated;
      });
    }

    // Apply search text filter
    if (this.searchText) {
      const searchLower = this.searchText.toLowerCase();
      filtered = filtered.filter(camera => {
        const developerName = this.getDeveloperName(camera.developer).toLowerCase();
        const projectName = this.getProjectName(camera.project).toLowerCase();
        return camera.camera.toLowerCase().includes(searchLower) ||
          (camera.cameraDescription?.toLowerCase() || '').includes(searchLower) ||
          (camera.serverFolder?.toLowerCase() || '').includes(searchLower) ||
          developerName.includes(searchLower) ||
          projectName.includes(searchLower);
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (this.sortBy === 'developer') {
        const devA = this.getDeveloperName(a.developer).toLowerCase();
        const devB = this.getDeveloperName(b.developer).toLowerCase();
        if (devA !== devB) return devA.localeCompare(devB);
        
        const projA = this.getProjectName(a.project).toLowerCase();
        const projB = this.getProjectName(b.project).toLowerCase();
        return projA.localeCompare(projB);
      } else {
        const serverA = (a.serverFolder || '').toLowerCase();
        const serverB = (b.serverFolder || '').toLowerCase();
        return serverA.localeCompare(serverB);
      }
    });

    this.filteredCameras = filtered;
    this.filteredCamerasCount = filtered.length;
    
    // Organize data hierarchically
    this.organizeHierarchicalData(filtered);
  }

  organizeHierarchicalData(cameras: Camera[]): void {
    // Safety check: ensure developers and projects are loaded
    if (this.developers.length === 0 || this.allProjects.length === 0) {
      console.warn('Cannot organize hierarchical data: developers or projects not loaded yet');
      return;
    }
    
    this.hierarchicalData = {};
    
    cameras.forEach(camera => {
      const developerId = camera.developer;
      const projectId = camera.project;
      
      // Initialize developer if not exists
      if (!this.hierarchicalData[developerId]) {
        const developer = this.developers.find(dev => dev._id === developerId);
        if (developer) {
          this.hierarchicalData[developerId] = {
            developer: developer,
            projects: {}
          };
        } else {
          // Skip this camera if developer is not found
          console.warn(`Developer with ID ${developerId} not found for camera ${camera.camera}`);
          return;
        }
      }
      
      // Initialize project if not exists
      if (!this.hierarchicalData[developerId]?.projects[projectId]) {
        const project = this.allProjects.find(proj => proj._id === projectId);
        if (project) {
          this.hierarchicalData[developerId].projects[projectId] = {
            project: project,
            cameras: []
          };
        } else {
          // Skip this camera if project is not found
          console.warn(`Project with ID ${projectId} not found for camera ${camera.camera}`);
          return;
        }
      }
      
      // Add camera to project
      if (this.hierarchicalData[developerId]?.projects[projectId]) {
        this.hierarchicalData[developerId].projects[projectId].cameras.push(camera);
      }
    });
  }

  getHierarchicalDataKeys(): string[] {
    if (!this.hierarchicalData) {
      return [];
    }
    return Object.keys(this.hierarchicalData).sort((a, b) => {
      const devA = this.hierarchicalData[a].developer.developerName.toLowerCase();
      const devB = this.hierarchicalData[b].developer.developerName.toLowerCase();
      return devA.localeCompare(devB);
    });
  }

  getProjectKeys(developerId: string): string[] {
    if (!this.hierarchicalData || !this.hierarchicalData[developerId]) {
      return [];
    }
    const projects = this.hierarchicalData[developerId].projects || {};
    return Object.keys(projects).sort((a, b) => {
      const projA = projects[a].project.projectName.toLowerCase();
      const projB = projects[b].project.projectName.toLowerCase();
      return projA.localeCompare(projB);
    });
  }

  getDeveloperName(developerId: string): string {
    const developer = this.developers.find(dev => dev._id === developerId);
    return developer?.developerName || 'Unknown Developer';
  }

  getDeveloperTag(developerId: string): string {
    const developer = this.developers.find(dev => dev._id === developerId);
    return developer?.developerTag || 'No Tag';
  }

  getProjectName(projectId: string): string {
    // First check in filtered projects, then in all projects
    const project = this.projects.find(proj => proj._id === projectId) || 
                   this.allProjects.find(proj => proj._id === projectId);
    return project?.projectName || 'Unknown Project';
  }

  getProjectTag(projectId: string): string {
    // First check in filtered projects, then in all projects
    const project = this.projects.find(proj => proj._id === projectId) || 
                   this.allProjects.find(proj => proj._id === projectId);
    return project?.projectTag || 'No Tag';
  }

  getImagePath(camera: Camera): string {
    const developer = this.developers.find(dev => dev._id === camera.developer);
    const project = this.allProjects.find(proj => proj._id === camera.project);
    if (!developer || !project || !camera.lastPhoto) {
      return `${environment.images}/logos/project/image.png`;
    }
    return `${environment.images}/media/upload/${developer.developerTag}/${project.projectTag}/${camera.camera}/large/${camera.lastPhoto}`;
  }

  isUpdated(lastPhoto: string): boolean {
    if (!lastPhoto) return false;
    const timeDifference = this.getTimeDifferenceInMinutes(lastPhoto);
    return timeDifference < 60; // Less than 1 hour
  }

  getTimeDifferenceInMinutes(lastPhoto: string): number {
    if (!lastPhoto) return Infinity;
    const now = new Date();
    const photoDate = this.parsePhotoDate(lastPhoto);
    return (now.getTime() - photoDate.getTime()) / (1000 * 60); // Convert to minutes
  }

  parsePhotoDate(lastPhoto: string): Date {
    const year = parseInt(lastPhoto.substring(0, 4));
    const month = parseInt(lastPhoto.substring(4, 6)) - 1; // Months are 0-based
    const day = parseInt(lastPhoto.substring(6, 8));
    const hour = parseInt(lastPhoto.substring(8, 10));
    const minute = parseInt(lastPhoto.substring(10, 12));
    const second = parseInt(lastPhoto.substring(12, 14));
    
    return new Date(year, month, day, hour, minute, second);
  }

  formatDate(lastPhoto: string): string {
    if (!lastPhoto) return 'No photo available';
    const date = this.parsePhotoDate(lastPhoto);
    return date.toLocaleString();
  }

  formatTimeDifference(lastPhoto: string): string {
    if (!lastPhoto) return 'No photo available';
    
    const timeDifference = this.getTimeDifferenceInMinutes(lastPhoto);
    
    if (timeDifference < 60) {
      return 'Updated';
    }
    
    const days = Math.floor(timeDifference / (60 * 24));
    const hours = Math.floor((timeDifference % (60 * 24)) / 60);
    const minutes = Math.floor(timeDifference % 60);

    const timeParts = [];
    if (days > 0) timeParts.push(`${days} day${days > 1 ? 's' : ''}`);
    if (hours > 0) timeParts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
    if (minutes > 0) timeParts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);

    return `Not updated (${timeParts.join(' ')})`;
  }

  openEditCamera(cameraId: string) {
    this.router.navigate(['/camera-form', cameraId]);
  }

  openAddCamera() {
    this.router.navigate(['/camera-form', { 
      developerId: this.selectedDeveloperId, 
      projectId: this.selectedProjectId 
    }]);
  }

  downloadConfig(camera: Camera): void {
    const developer = this.developers.find(dev => dev._id === camera.developer);
    const project = this.allProjects.find(proj => proj._id === camera.project);

    const configData = [
      {
        server: "tempcloud",
        folder: "/home/lsl/media/lslcloud1",
        country: camera.country,
        developer: developer?.developerTag,
        project: project?.projectTag,
        camera: camera.camera
      }
    ];

    const blob = new Blob([JSON.stringify(configData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'configure.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    window.URL.revokeObjectURL(url);
  }

  onImageLoad(cameraId: string): void {
    this.imageLoaded[cameraId] = true;
  }

  getProjectStatus(projectId: string): string {
    return this.projectStatuses[projectId] || 'unknown';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'new':
        return 'status-new';
      case 'active':
        return 'status-active';
      case 'on hold':
        return 'status-hold';
      case 'finished':
        return 'status-finished';
      default:
        return 'status-unknown';
    }
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        // Filter users to only include Admin and Super Admin roles
        this.users = data.filter(user => 
          user.role === 'Admin' || user.role === 'Super Admin'
        );
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  createTask(camera: Camera): void {
    const developer = this.developers.find(dev => dev._id === camera.developer);
    const project = this.allProjects.find(proj => proj._id === camera.project);

    if (!developer || !project) {
      console.error('Developer or project not found for camera:', camera);
      this.snackBar.open('Error: Developer or project information not found', 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    const dialogRef = this.dialog.open(TaskCreationDialogComponent, {
      width: '500px',
      data: {
        camera: camera,
        users: this.users,
        taskTypes: this.taskTypes,
        taskType: '',
        taskDescription: '',
        assignedUsers: [],
        developer: developer,
        project: project
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.maintenanceService.createMaintenance(result).subscribe({
          next: () => {
            this.snackBar.open('Maintenance task created successfully', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
          },
          error: (error) => {
            console.error('Error creating maintenance task:', error);
            this.snackBar.open('Error creating maintenance task', 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
  }

  checkUserRole(): void {
    const userRole = this.authService.getUserRole();
    this.isSuperAdmin = userRole === 'Super Admin';
  }

  openCameraHistory(cameraId: string): void {
    this.router.navigate(['/camera-history', cameraId]);
  }

  openProjectInfo(projectId: string): void {
    const project = this.allProjects.find(proj => proj._id === projectId);
    if (project) {
      const dialogRef = this.dialog.open(ProjectInfoDialogComponent, {
        width: '800px',
        maxWidth: '90vw',
        data: { project: project }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // Handle saved attachments if needed
          console.log('Project attachments saved:', result);
        }
      });
    } else {
      this.snackBar.open('Project not found', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }
}
