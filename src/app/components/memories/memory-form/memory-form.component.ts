import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { DeveloperService } from '../../../services/developer.service';
import { ProjectService } from '../../../services/project.service';
import { CameraService } from '../../../services/camera.service';
import { UserService } from '../../../services/users.service';
import { MemoryService } from '../../../services/memory.service';
import { Developer } from '../../../models/developer.model';
import { Project } from '../../../models/project.model';
import { Camera } from '../../../models/camera.model';
import { User } from '../../../models/user.model';
import { Memory } from '../../../models/memory.model';

@Component({
  selector: 'app-memory-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './memory-form.component.html',
  styleUrls: ['./memory-form.component.css']
})
export class MemoryFormComponent implements OnInit {
  memory: Partial<Memory> = {
    endDate: new Date(),
    numberOfPics: 0
  };
  
  developers: Developer[] = [];
  projects: Project[] = [];
  cameras: Camera[] = [];
  users: User[] = [];
  
  selectedDeveloperId: string | null = null;
  selectedProjectId: string | null = null;
  selectedCameraId: string | null = null;
  selectedUserId: string | null = null;
  
  isEditMode = false;
  isLoading = false;

  constructor(
    private developerService: DeveloperService,
    private projectService: ProjectService,
    private cameraService: CameraService,
    private userService: UserService,
    private memoryService: MemoryService,
    private route: ActivatedRoute,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.loadDevelopers();
    this.loadUsers();
    
    // Check if we're in edit mode
    const memoryId = this.route.snapshot.paramMap.get('id');
    if (memoryId) {
      this.isEditMode = true;
      this.loadMemory(memoryId);
    } else {
      // Set default dates
      const today = new Date();
      //this.memory.startDate = today;
      this.memory.endDate = today;
      this.memory.dateOfRemoval = today;
      this.memory.dateOfReceive = today;
    }
  }

  loadDevelopers(): void {
    this.isLoading = true;
    this.developerService.getAllDevelopers().subscribe({
      next: (data) => {
        this.developers = data;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  loadProjects(developerId: string): void {
    this.isLoading = true;
    this.projectService.getProjectsByDeveloper(developerId).subscribe({
      next: (data) => {
        this.projects = data;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  loadCameras(projectId: string): void {
    this.isLoading = true;
    this.cameraService.getCamerasByProject(projectId).subscribe({
      next: (data) => {
        this.cameras = data;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.isLoading = false;
        // Auto-select current user if available
        const currentUser = this.users.find(u => u._id === 'current-user-id'); // Replace with your auth logic
        if (currentUser) {
          this.selectedUserId = currentUser._id;
          //this.memory.user = currentUser.name
        }
      },
      error: () => this.isLoading = false
    });
  }

  loadMemory(id: string): void {
    this.isLoading = true;
    this.memoryService.getMemoryById(id).subscribe({
      next: (data) => {
        console.log(data);
        this.memory = data;
        this.selectedDeveloperId = data.developer;
        this.loadProjects(data.developer);
        this.selectedProjectId = data.project;
        this.loadCameras(data.project);
        this.selectedCameraId = data.camera;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  onDeveloperChange(): void {
    if (this.selectedDeveloperId) {
      this.loadProjects(this.selectedDeveloperId);
      this.projects = [];
      this.cameras = [];
      this.selectedProjectId = null;
      this.selectedCameraId = null;
      
      // Set developer in memory object
      const selectedDev = this.developers.find(d => d._id === this.selectedDeveloperId);
      if (selectedDev) {
        this.memory.developer = selectedDev.developerName
      }
    }
  }

  onProjectChange(): void {
    if (this.selectedProjectId) {
      this.loadCameras(this.selectedProjectId);
      this.cameras = [];
      this.selectedCameraId = null;
      
      // Set project in memory object
      const selectedProj = this.projects.find(p => p._id === this.selectedProjectId);
      if (selectedProj) {
        this.memory.project = selectedProj.projectName
      }
    }
  }

  onCameraChange(): void {
    if (this.selectedCameraId) {
      const selectedCam = this.cameras.find(c => c._id === this.selectedCameraId);
      if (selectedCam) {
        this.memory.camera = selectedCam.camera
        };
      }    
  }

  // onUserChange(): void {
  //   if (this.selectedUserId) {
  //     const selectedUser = this.users.find(u => u._id === this.selectedUserId);
  //     if (selectedUser) {
  //       this.memory.user = {
  //         _id: selectedUser._id,
  //         userName: selectedUser.name
  //       };
  //     }
  //   }
  // }

  onSubmit(): void {
    if (!this.memory.developer || !this.memory.project || !this.memory.camera) {
      alert('Please fill all required fields');
      return;
    }

    this.isLoading = true;
    
    if (this.isEditMode && this.memory._id) {
      this.memoryService.updateMemory(this.memory._id, this.memory as Memory).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/memories']);
        },
        error: () => this.isLoading = false
      });
    } else {
      this.memoryService.createMemory(this.memory as Memory).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/memories']);
        },
        error: () => this.isLoading = false
      });
    }
  }
}