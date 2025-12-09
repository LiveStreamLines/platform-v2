import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTable } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MaintenanceService } from '../../services/maintenance.service';
import { Maintenance, TASK_TYPES } from '../../models/maintenance.model';
import { DeveloperService } from '../../services/developer.service';
import { ProjectService } from '../../services/project.service';
import { CameraService } from '../../services/camera.service';
import { UserService } from '../../services/users.service';
import { Developer } from '../../models/developer.model';
import { Project } from '../../models/project.model';
import { Camera } from '../../models/camera.model';
import { User } from '../../models/user.model';
import { TaskCompletionDialogComponent } from './task-completion-dialog.component';
import { EditMaintenanceDialogComponent } from './edit-maintenance-dialog.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
    TaskCompletionDialogComponent,
    EditMaintenanceDialogComponent
  ],
  templateUrl: './maintenance.component.html',
  styleUrls: ['./maintenance.component.css']
})
export class MaintenanceComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<Maintenance>;

  isSuperAdmin: boolean = false;
  currentUserId: string | null = null;

  displayedColumns: string[] = [
    'dateOfRequest',
    'taskType',
    'taskDescription',
    'camera',
    'assignedUsers',
    'status',
    'actions'
  ];
  
  developers: Developer[] = [];
  projects: Project[] = [];
  cameras: Camera[] = [];
  users: User[] = [];
  maintenanceList: Maintenance[] = [];
  filteredMaintenance: Maintenance[] = [];
  
  selectedDeveloperId: string | null = null;
  selectedProjectId: string | null = null;
  selectedCameraId: string | null = null;
  selectedUserId: string | null = null;
  selectedTaskType: string | null = null;
  selectedStatus: string | null = 'pending';
  
  taskTypes = TASK_TYPES;
  statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  limitedStatusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'in-progress', label: 'In Progress' }
  ];

  editableStatusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  showEditForm = false;
  editingMaintenance: Maintenance | null = null;

  allProjects: Project[] = [];
  allCameras: Camera[] = [];

  constructor(
    private maintenanceService: MaintenanceService,
    private developerService: DeveloperService,
    private projectService: ProjectService,
    private cameraService: CameraService,
    private userService: UserService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {
    // Check if current user is super admin
    this.isSuperAdmin = this.authService.getUserRole() === 'Super Admin';
    this.currentUserId = this.authService.getUserId();
  }

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit() {
    // Set up sorting
    this.sort.sortChange.subscribe(() => {
      this.paginator.pageIndex = 0;
      this.applyFilters();
    });

    // Set up pagination
    this.paginator.page.subscribe(() => {
      this.applyFilters();
    });
  }

  loadData(): void {
    this.loadDevelopers();
    this.loadUsers();
    this.loadMaintenance();
    this.loadAllProjects();
    this.loadAllCameras();
  }

  loadDevelopers(): void {
    this.developerService.getAllDevelopers().subscribe({
      next: (data) => {
        this.developers = data;
      },
      error: (error) => {
        console.error('Error loading developers:', error);
      }
    });
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data.filter(user => 
          user.role === 'Admin' || user.role === 'Super Admin'
        );
        // Set default selected user to current user
        if (this.currentUserId) {
          this.selectedUserId = this.currentUserId;
        }
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  loadMaintenance(): void {
    this.maintenanceService.getAllMaintenance().subscribe({
      next: (data) => {
        this.maintenanceList = data;
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error loading maintenance:', error);
      }
    });
  }

  loadAllProjects(): void {
    this.projectService.getAllProjects().subscribe({
      next: (data) => {
        this.allProjects = data;
        this.filterProjects();
      },
      error: (error) => {
        console.error('Error loading all projects:', error);
      }
    });
  }

  loadAllCameras(): void {
    this.cameraService.getAllCameras().subscribe({
      next: (data) => {
        this.allCameras = data;
        this.filterCameras();
      },
      error: (error) => {
        console.error('Error loading all cameras:', error);
      }
    });
  }

  filterProjects(): void {
    if (this.selectedDeveloperId) {
      this.projects = this.allProjects.filter(project => project.developer === this.selectedDeveloperId);
    } else {
      this.projects = this.allProjects;
    }
  }

  filterCameras(): void {
    if (this.selectedProjectId) {
      this.cameras = this.allCameras.filter(camera => camera.project === this.selectedProjectId);
    } else {
      this.cameras = this.allCameras;
    }
  }

  getDeveloperName(developerId: string | undefined): string {
    if (!developerId) return 'Unknown Developer';
    const developer = this.developers.find(dev => dev._id === developerId);
    return developer ? developer.developerName : 'Unknown Developer';
  }

  getProjectName(projectId: string | undefined): string {
    if (!projectId) return 'Unknown Project';
    const project = this.projects.find(proj => proj._id === projectId);
    return project ? project.projectName : 'Unknown Project';
  }

  getCameraName(cameraId: string | undefined): string {
    if (!cameraId) return 'Unknown Camera';
    const camera = this.cameras.find(cam => cam._id === cameraId);
    return camera ? camera.camera : 'Unknown Camera';
  }

  getUserName(userId: string): string {
    const user = this.users.find(u => u._id === userId);
    return user ? user.name : 'Unknown User';
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }

  onDeveloperChange(): void {
    this.selectedProjectId = null;
    this.selectedCameraId = null;
    this.filterProjects();
    this.filterCameras();
    this.applyFilters();
  }

  onProjectChange(): void {
    this.selectedCameraId = null;
    this.filterCameras();
    this.applyFilters();
  }

  onCameraChange(): void {
    this.applyFilters();
  }

  onUserChange(): void {
    this.applyFilters();
  }

  onTaskTypeChange(): void {
    this.applyFilters();
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  onStatusChangeEdit(): void {
    if (this.editingMaintenance) {
      if (this.editingMaintenance.status === 'pending') {
        this.editingMaintenance.startTime = undefined;
        this.editingMaintenance.completionTime = undefined;
        this.editingMaintenance.userComment = '';
      } else if (this.editingMaintenance.status === 'in-progress' && !this.editingMaintenance.startTime) {
        this.editingMaintenance.startTime = new Date().toISOString();
      }
    }
  }

  applyFilters(): void {
    let filtered = [...this.maintenanceList];

    if (this.selectedDeveloperId) {
      filtered = filtered.filter(m => m.developerId === this.selectedDeveloperId);
    }

    if (this.selectedProjectId) {
      filtered = filtered.filter(m => m.projectId === this.selectedProjectId);
    }

    if (this.selectedCameraId) {
      filtered = filtered.filter(m => m.cameraId === this.selectedCameraId);
    }

    if (this.selectedUserId) {
      filtered = filtered.filter(m => m.assignedUsers.includes(this.selectedUserId!));
    }

    if (this.selectedTaskType) {
      filtered = filtered.filter(m => m.taskType === this.selectedTaskType);
    }

    if (this.selectedStatus) {
      filtered = filtered.filter(m => m.status === this.selectedStatus);
    }

    // Apply sorting
    if (this.sort.active && this.sort.direction) {
      filtered.sort((a, b) => {
        const isAsc = this.sort.direction === 'asc';
        switch (this.sort.active) {
          case 'dateOfRequest':
            return this.compareDates(a.dateOfRequest, b.dateOfRequest, isAsc);
          case 'taskType':
            return this.compareStrings(a.taskType, b.taskType, isAsc);
          case 'taskDescription':
            return this.compareStrings(a.taskDescription, b.taskDescription, isAsc);
          case 'assignedUsers':
            return this.compareStrings(this.getUserName(a.assignedUsers[0]), this.getUserName(b.assignedUsers[0]), isAsc);
          case 'status':
            return this.compareStrings(a.status, b.status, isAsc);
          default:
            return 0;
        }
      });
    }

    // Apply pagination
    const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
    this.filteredMaintenance = filtered.slice(startIndex, startIndex + this.paginator.pageSize);
  }

  private compareDates(a: string, b: string, isAsc: boolean): number {
    return (new Date(a).getTime() - new Date(b).getTime()) * (isAsc ? 1 : -1);
  }

  private compareStrings(a: string, b: string, isAsc: boolean): number {
    return a.localeCompare(b) * (isAsc ? 1 : -1);
  }

  editMaintenance(maintenance: Maintenance): void {
    const dialogRef = this.dialog.open(EditMaintenanceDialogComponent, {
      width: '500px',
      data: { 
        maintenance: { ...maintenance },
        developers: this.developers,
        projects: this.projects,
        cameras: this.cameras,
        users: this.users
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && maintenance._id) {
        this.maintenanceService.updateMaintenance(maintenance._id, result).subscribe({
          next: () => {
            this.snackBar.open('Maintenance request updated successfully', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.loadMaintenance();
          },
          error: (error) => {
            console.error('Error updating maintenance:', error);
            this.snackBar.open('Error updating maintenance request', 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
  }

  cancelEdit(): void {
    this.showEditForm = false;
    this.editingMaintenance = null;
  }

  saveEdit(): void {
    if (this.editingMaintenance && this.editingMaintenance._id) {
      this.maintenanceService.updateMaintenance(this.editingMaintenance._id, this.editingMaintenance).subscribe({
        next: () => {
          this.snackBar.open('Maintenance request updated successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.showEditForm = false;
          this.editingMaintenance = null;
          this.loadMaintenance();
        },
        error: (error) => {
          console.error('Error updating maintenance:', error);
          this.snackBar.open('Error updating maintenance request', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  startTask(maintenance: Maintenance): void {
    if (!maintenance._id) {
      console.error('Cannot start task: No task ID found');
      return;
    }

    const updatedMaintenance: Maintenance = {
      ...maintenance,
      status: 'in-progress',
      startTime: new Date().toISOString()
    };

    this.maintenanceService.updateMaintenance(maintenance._id, updatedMaintenance).subscribe({
      next: () => {
        this.snackBar.open('Task started successfully', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.loadMaintenance();
      },
      error: (error) => {
        console.error('Error starting task:', error);
        this.snackBar.open('Error starting task', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  completeTask(maintenance: Maintenance): void {
    if (!maintenance._id) {
      console.error('Cannot complete task: No task ID found');
      return;
    }

    const dialogRef = this.dialog.open(TaskCompletionDialogComponent, {
      width: '500px',
      data: { maintenance }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && maintenance._id) {
        const updatedMaintenance: Maintenance = {
          ...maintenance,
          status: 'completed',
          completionTime: new Date().toISOString(),
          userComment: result.comment
        };

        this.maintenanceService.updateMaintenance(maintenance._id, updatedMaintenance).subscribe({
          next: () => {
            this.snackBar.open('Task completed successfully', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.loadMaintenance();
          },
          error: (error) => {
            console.error('Error completing task:', error);
            this.snackBar.open('Error completing task', 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
  }
} 