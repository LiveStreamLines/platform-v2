import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

import { CameraService } from '../../services/camera.service';
import { MaintenanceService } from '../../services/maintenance.service';
import { DeveloperService } from '../../services/developer.service';
import { ProjectService } from '../../services/project.service';
import { CameraDetailService } from '../../services/camera-detail.service';
import { UserService } from '../../services/users.service';
import { Camera } from '../../models/camera.model';
import { Maintenance } from '../../models/maintenance.model';
import { Developer } from '../../models/developer.model';
import { Project } from '../../models/project.model';
import { User } from '../../models/user.model';

interface MaintenanceWithLast extends Maintenance {
  isLast?: boolean;
  assignedUserNames?: string[];
}

@Component({
  selector: 'app-camera-history',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './camera-history.component.html',
  styleUrls: ['./camera-history.component.css']
})
export class CameraHistoryComponent implements OnInit {
  camera: Camera | null = null;
  developer: Developer | null = null;
  project: Project | null = null;
  maintenanceTasks: MaintenanceWithLast[] = [];
  firstPhotoDate: string | null = null;
  isLoading = true;
  users: User[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cameraService: CameraService,
    private maintenanceService: MaintenanceService,
    private developerService: DeveloperService,
    private projectService: ProjectService,
    private cameraDetailService: CameraDetailService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    const cameraId = this.route.snapshot.paramMap.get('id');
    if (cameraId) {
      this.loadUsers();
      this.loadCameraData(cameraId);
    } else {
      this.router.navigate(['/camera-monitor']);
    }
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  getUserName(userId: string): string {
    const user = this.users.find(u => u._id === userId);
    return user ? user.name : 'Unknown User';
  }

  loadCameraData(cameraId: string): void {
    this.isLoading = true;
    this.cameraService.getCameraById(cameraId).subscribe({
      next: (camera) => {
        this.camera = camera;
        this.loadDeveloperAndProject(camera.developer, camera.project);
      },
      error: (error) => {
        console.error('Error loading camera:', error);
        this.isLoading = false;
        this.router.navigate(['/camera-monitor']);
      }
    });
  }

  loadDeveloperAndProject(developerId: string, projectId: string): void {
    let developerLoaded = false;
    let projectLoaded = false;

    this.developerService.getDeveloperById(developerId).subscribe({
      next: (developer) => {
        this.developer = developer;
        developerLoaded = true;
        if (projectLoaded) {
          this.loadFirstPhotoDate();
          this.loadMaintenanceTasks(this.camera!._id);
        }
      },
      error: (error) => {
        console.error('Error loading developer:', error);
        this.isLoading = false;
      }
    });

    this.projectService.getProjectById(projectId).subscribe({
      next: (project) => {
        this.project = project;
        projectLoaded = true;
        if (developerLoaded) {
          this.loadFirstPhotoDate();
          this.loadMaintenanceTasks(this.camera!._id);
        }
      },
      error: (error) => {
        console.error('Error loading project:', error);
        this.isLoading = false;
      }
    });
  }

  loadMaintenanceTasks(cameraId: string): void {
    this.maintenanceService.getMaintenanceByCamera(cameraId).subscribe({
      next: (tasks) => {
        this.maintenanceTasks = tasks.sort((a, b) => {
          const dateA = a.dateOfRequest ? new Date(a.dateOfRequest).getTime() : 0;
          const dateB = b.dateOfRequest ? new Date(b.dateOfRequest).getTime() : 0;
          return dateB - dateA;
        }).map((task, index, array) => ({
          ...task,
          isLast: index === array.length - 1,
          assignedUserNames: task.assignedUsers.map(userId => this.getUserName(userId))
        }));
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading maintenance tasks:', error);
        this.isLoading = false;
      }
    });
  }

  loadFirstPhotoDate(): void {
    if (this.developer && this.project && this.camera) {
      this.cameraDetailService.getCameraDetails(
        this.developer.developerTag,
        this.project.projectTag,
        this.camera.camera
      ).subscribe({
        next: (cameraDetail) => {
          this.firstPhotoDate = cameraDetail.firstPhoto;
        },
        error: (error) => {
          console.error('Error loading first photo date:', error);
        }
      });
    }
  }

  formatDate(date: string): string {
    if (!date) return 'Not available';
    const year = date.substring(0, 4);
    const month = date.substring(4, 6);
    const day = date.substring(6, 8);
    return `${year}-${month}-${day}`;
  }

  formatDateTime(date: string): string {
    if (!date) return 'Not available';
    const dateObj = new Date(date);
    return dateObj.toLocaleString();
  }

  getTaskTypeLabel(type: string): string {
    return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ');
  }

  getTaskStatusClass(status: string): string {
    return `status-${status.toLowerCase().replace(/\s+/g, '-')}`;
  }

  goBack(): void {
    this.router.navigate(['/camera-monitor']);
  }
}
