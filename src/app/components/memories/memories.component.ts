import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

import { Observable, of, map } from 'rxjs';

// Services
import { MemoryService } from '../../services/memory.service';
import { DeveloperService } from '../../services/developer.service';
import { ProjectService } from '../../services/project.service';
import { UserService } from '../../services/users.service';
import { AuthService } from '../../services/auth.service';


// Models
import { Memory } from '../../models/memory.model';
import { Developer } from '../../models/developer.model';
import { Project } from '../../models/project.model';
import { Camera } from '../../models/camera.model';
import { User } from '../../models/user.model';
import { CameraService } from '../../services/camera.service';

@Component({
  selector: 'app-memories',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatChipsModule,
    MatCheckboxModule
  ],
  templateUrl: './memories.component.html',
  styleUrls: ['./memories.component.css']
})
export class MemoriesComponent implements OnInit {
  // Data Lists
  developers: Developer[] = [];
  projects: Project[] = [];
  memories: Memory[] = [];
  cameras: Camera[] = [];
  users: User[] = [];

  showSizeWarning = false; // Changed from true to false
  filteredMemories: Memory[] = [];     // Filtered subset for display

  memoryRole: string | null  = "";
  userRole: string | null = "";

  // Selected Filters
  selectedDeveloperId: string | null = null;
  selectedProjectId: string | null = null;
  selectedCameraId: string | null = null;
  selectedUserId: string | null = null;
  
  statusFilter: string | null = null;
  statusOptions = [
    { value: null, viewValue: 'All Statuses' },
    { value: 'active', viewValue: 'Active' },
    { value: 'removed', viewValue: 'Removed' },
    { value: 'archived', viewValue: 'Archived' }
  ];

  // UI State
  isLoading = false;
  displayedColumns: string[] = [
    'developer',
    'project',
    'camera',
    'dateRange',
    'pictures',
    'shuttercount',
    'memoryUsed',
    'memoryAvailable',
    'status',
    'removeDate',
    'receiveDate',
    'actions'
  ];

  constructor(
    private memoryService: MemoryService,
    private developerService: DeveloperService,
    private projectService: ProjectService,
    private cameraService: CameraService,
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.memoryRole = this.authService.getMemoryRole() || null;
    this.userRole = this.authService.getUserRole() || null;

    // Set initial status filter based on role
    if (this.memoryRole === 'removal') {
      this.statusFilter = 'active'; // Lock to active for removal role
    } 
    else if (this.memoryRole === 'archiver') {
      this.statusFilter = 'removed'; // Lock to removed for archiver role
    }

    this.loadDevelopers();
    this.loadMemories();  // Load all memories upfront
    this.loadUsers();
  }

  
  loadMemories(): void {
    this.isLoading = true;
    this.memoryService.getMemories().subscribe({
      next: (data) => {
        console.log(data);
        this.memories = data.map(memory => ({
          ...memory,
        //  startDate: new Date(memory.startDate),
          endDate: new Date(memory.endDate),
          dateOfRemoval: memory.dateOfRemoval ? new Date(memory.dateOfRemoval) : null,
          dateOfReceive: memory.dateOfReceive ? new Date(memory.dateOfReceive) : null
        }));
        this.filterMemories();
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  loadDevelopers(): void {
    this.developerService.getAllDevelopers().subscribe(developers => {
      this.developers = developers;
    });
  }

  loadProjects(developerId: string): void {
    if (developerId) {
      this.projectService.getProjectsByDeveloperTag(developerId).subscribe(projects => {
        console.log(developerId);
        console.log(projects);
        this.projects = projects;
        this.selectedProjectId = null;
        this.cameras = [];
        this.selectedCameraId = null;
        this.filterMemories();
      });
    }
  }

  loadCameras(projectId: string): void {
    if (projectId) {
      this.cameraService.getCamerasByProjectTag(projectId).subscribe(cameras => {
        this.cameras = cameras;
        this.selectedCameraId = null;
        this.filterMemories();
      });
    }
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe(users => {
      this.users = users;
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active': return 'primary';
      case 'archived': return 'success';
      case 'removed': return 'warn';
      case 'maintenance': return '';
      case 'expiring': return '';
      case 'expired': return 'warn';
      default: return '';
    }
  }

  // Add this method to parse the memory string
  parseMemorySize(memorySize: string): number {
    if (!memorySize) return 0;
    const size = parseFloat(memorySize.replace(/[^\d.]/g, ''));
    return size;
  }

  // Update the isLowMemory method
  isLowMemory(memory: Memory): boolean {
    if (memory.status !== 'active') return false;
    const availableGB = this.parseMemorySize(memory.memoryAvailable);
    return availableGB < 10;
  }


  filterMemories(): void {
    this.filteredMemories = this.memories.filter(memory => {
      const matchesDeveloper = !this.selectedDeveloperId || 
        memory.developer === this.selectedDeveloperId;
      const matchesProject = !this.selectedProjectId || 
        memory.project === this.selectedProjectId;
      const matchesCamera = !this.selectedCameraId || 
        memory.camera === this.selectedCameraId;
      const matchesStatus = !this.statusFilter || 
        memory.status === this.statusFilter;
        const matchesSizeWarning = !this.showSizeWarning || 
        this.isLowMemory(memory);
      
      return matchesDeveloper && matchesProject && matchesCamera && matchesStatus && matchesSizeWarning;
    });
  }

   getDeveloperName(developerTag?: string): Observable<string> {
      if (!developerTag) return of ('Not assigned');
      return this.developerService.getDeveloperByTag2(developerTag).pipe(
        map(developer => developer?.developerName || 'Unkown')
      );    
    }

    getProjectName(projectTag?: string): Observable<string> {
      if (!projectTag) return of ('Not assigned');
      return this.projectService.getProjectByTag2(projectTag).pipe(
        map(project => project?.projectName || 'Unkown')
      );    
    }

  onDeveloperChange(): void {
    if (!this.selectedDeveloperId) {
      // "All Developers" selected
      this.projects = [];
      this.cameras = [];
      this.selectedProjectId = null;
      this.selectedCameraId = null;
    } else {
      this.loadProjects(this.selectedDeveloperId);
    }
    this.filterMemories();
  }

  onProjectChange(): void {
    if (!this.selectedProjectId) {
      // "All Projects" selected
      this.cameras = [];
      this.selectedCameraId = null;
    } else {
      this.loadCameras(this.selectedProjectId);
    }
    this.filterMemories();
  }

  onCameraChange(): void {
    this.filterMemories();
  }

  onUserChange(): void {
    this.filterMemories();
  }

  // Add status change handler
  onStatusChange(): void {
    this.filterMemories();
  }

  openAddMemory(): void {
    this.router.navigate(['/memory-form']);
  }

  openEditMemory(memoryId: string): void {
    this.router.navigate(['/memory-form', memoryId]);
  }

  updateMemoryStatus(memoryId: string, newStatus: 'removed' | 'archived'): void {
    const update = {
      status: newStatus,
      ...(newStatus === 'removed' && { dateOfRemoval: new Date(), RemovalUser: this.authService.getUsername() }),
      ...(newStatus === 'archived' && { dateOfReceive: new Date(), RecieveUser: this.authService.getUsername() })
    };
  
    this.memoryService.updateMemory(memoryId, update).subscribe({
      next: (updatedMemory) => {
        // Update local data
        const index = this.memories.findIndex(m => m._id === memoryId);
        if (index !== -1) {
          this.memories[index] = {
            ...this.memories[index],
            ...updatedMemory,
            dateOfRemoval: updatedMemory.dateOfRemoval ? new Date(updatedMemory.dateOfRemoval) : null,
            dateOfReceive: updatedMemory.dateOfReceive ? new Date(updatedMemory.dateOfReceive) : null
          };
          this.filterMemories();
        }
      },
      error: (err) => console.error('Error updating status:', err)
    });
  }
}