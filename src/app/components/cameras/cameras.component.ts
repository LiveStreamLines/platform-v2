import { Component, OnInit, ViewChild, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { DeveloperService } from '../../services/developer.service';
import { ProjectService } from '../../services/project.service';
import { CameraService } from '../../services/camera.service';
import { Developer } from '../../models/developer.model';
import { Project } from '../../models/project.model';
import { Camera } from '../../models/camera.model';
import { Router } from '@angular/router';
import { CameraInstallationDialogComponent } from '../sales-order/camera-installation-dialog/camera-installation-dialog.component';

@Component({
  selector: 'app-camera',
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
    MatSortModule,
    MatPaginatorModule,
    MatDialogModule,
    MatSnackBarModule,
    MatButtonModule,
  ],
  templateUrl: './cameras.component.html',
  styleUrls: ['./cameras.component.css']
})
export class CameraComponent implements OnInit, AfterViewChecked {
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  developers: Developer[] = [];
  projects: Project[] = [];
  cameras: Camera[] = [];
  allCameras: Camera[] = [];
  selectedDeveloperId: string | null = null;
  selectedProjectId: string | null = null;
  isLoading = false;
  private sortInitialized = false;
  private paginatorInitialized = false;

  // Table data source for sorting and pagination
  dataSource = new MatTableDataSource<Camera>();
  displayedColumns: string[] = ['name', 'country', 'serverFolder', 'createdDate', 'installedDate', 'status', 'blockUnblock', 'actions', 'download'];
  allDevelopersDisplayedColumns: string[] = ['name', 'developer', 'project', 'country', 'serverFolder', 'createdDate', 'installedDate', 'status', 'blockUnblock', 'actions', 'download'];

  constructor(
    private developerService: DeveloperService,
    private projectService: ProjectService,
    private router: Router, 
    private cameraService: CameraService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    // Set up custom sort function for dates
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'createdDate': return new Date(item.createdDate).getTime();
        case 'name': return item.camera.toLowerCase();
        case 'country': return item.country?.toLowerCase() || '';
        case 'serverFolder': return item.serverFolder?.toLowerCase() || '';
        case 'developer': return this.getDeveloperName(item.developer)?.toLowerCase() || '';
        case 'project': return this.getProjectName(item.project)?.toLowerCase() || '';
        default: {
          const value = item[property as keyof Camera];
          if (typeof value === 'boolean') return value ? 1 : 0;
          if (typeof value === 'string') return value.toLowerCase();
          if (typeof value === 'number') return value;
          return '';
        }
      }
    };

    // Set up custom filter function
    this.dataSource.filterPredicate = (data: Camera, filter: string) => {
      const searchStr = filter.toLowerCase();
      return !!(
        data.camera.toLowerCase().includes(searchStr) ||
        (data.country && data.country.toLowerCase().includes(searchStr)) ||
        (data.serverFolder && data.serverFolder.toLowerCase().includes(searchStr)) ||
        this.getDeveloperName(data.developer)?.toLowerCase().includes(searchStr) ||
        this.getProjectName(data.project)?.toLowerCase().includes(searchStr)
      );
    };
  }

  ngOnInit(): void {
    this.loadDevelopers();
  }

  ngAfterViewChecked(): void {
    // Initialize sort if not already done
    if (this.sort && !this.sortInitialized) {
      this.dataSource.sort = this.sort;
      this.sortInitialized = true;
      console.log('Sort initialized');
    }
    
    // Initialize paginator if not already done
    if (this.paginator && !this.paginatorInitialized) {
      this.dataSource.paginator = this.paginator;
      this.paginatorInitialized = true;
      console.log('Paginator initialized');
    }

    // Always ensure connections are maintained
    this.ensureDataSourceConnections();
  }

  loadDevelopers(): void {
    this.isLoading = true;
    this.developerService.getAllDevelopers().subscribe((data) => {
      this.developers = data;
      this.isLoading = false;
      // Default to "All Developers" (null value)
      this.selectedDeveloperId = null;
      this.loadProjects();
    });
  }

  loadProjects(): void {
    if (this.selectedDeveloperId) {
      // Specific developer selected
      this.isLoading = true;
      this.projectService.getProjectsByDeveloper(this.selectedDeveloperId).subscribe((data) => {
        this.projects = data;
        this.isLoading = false;
        if (this.projects.length) {
          this.selectedProjectId = this.projects[0]._id; // Default to first project
          this.loadCameras();
        } else {
          // No projects for this developer
          this.cameras = [];
          this.dataSource.data = [];
        }
      });
    } else {
      // "All Developers" selected - load all projects for display purposes
      this.isLoading = true;
      this.projectService.getAllProjects().subscribe((data) => {
        this.projects = data;
        this.isLoading = false;
        this.loadAllCameras();
      });
    }
  }

  loadCameras(): void {
    if (this.selectedProjectId) {
      this.isLoading = true;
      this.cameraService.getCamerasByProject(this.selectedProjectId).subscribe((data) => {
        this.cameras = data;
        this.allCameras = data;
        this.dataSource.data = data;
        console.log('Cameras loaded:', data.length, 'items');
        this.isLoading = false;
        // Ensure connections are maintained after data load
        this.ensureDataSourceConnections();
        this.cdr.detectChanges();
      });
    }
  }

  loadAllCameras(): void {
    this.isLoading = true;
    this.cameraService.getAllCameras().subscribe((data) => {
      this.allCameras = data;
      this.cameras = data;
      this.dataSource.data = data;
      console.log('All cameras loaded:', data.length, 'items');
      this.isLoading = false;
      // Ensure connections are maintained after data load
      this.ensureDataSourceConnections();
      this.cdr.detectChanges();
    });
  }

  onDeveloperChange(): void {
    if (this.selectedDeveloperId) {
      // Specific developer selected
      this.selectedProjectId = null;
      this.projects = [];
      this.cameras = [];
      this.resetDataSource();
      this.loadProjects();
    } else {
      // "All Developers" selected
      this.selectedProjectId = null;
      this.projects = [];
      this.loadProjects(); // This will now load all projects for display
    }
  }

  onProjectChange(): void {
    if (this.selectedDeveloperId) {
      this.cameras = [];
      this.resetDataSource();
      this.loadCameras();
    }
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openEditCamera(cameraId: string) {
    this.router.navigate(['/camera-form', cameraId]);
  }

  openAddCamera(){
    this.router.navigate(['/camera-form',{ developerId: this.selectedDeveloperId, projectId: this.selectedProjectId }]);
  }

  toggleBlockStatus(camera: Camera): void {
    // Initialize blocked as false if undefined
    if (camera.blocked === undefined) {
      camera.blocked = false;
    }
    camera.blocked = !camera.blocked; // Toggle the blocked field
    this.saveBlockStatus(camera); // Save the updated status
  }
  
  saveBlockStatus(camera: Camera): void {
    // Ensure blocked is a boolean
    const blockedStatus = camera.blocked ?? false;
    
    // Send the blocked status using the new updateCameraStatus method
    this.cameraService.updateCameraStatus(camera._id, { blocked: blockedStatus }).subscribe({
      next: (response) => {
        console.log(`Camera ${camera.camera} updated:`, response);
      },
      error: (error) => {
        console.error(`Error updating camera ${camera.camera}:`, error);
        // Revert the change in case of an error
        camera.blocked = !blockedStatus;
      }
    });
  }

  downloadConfig(camera: Camera): void {
    const developer = this.developers.find(dev => dev._id === camera.developer);
    const project = this.projects.find(proj=> proj._id === camera.project);

    const configData = [
      {
        server: "tempcloud",
        folder: "/home/lsl/media/lslcloud1",
        country: camera.country === 'Saudi Arabia' ? 'Saudi' : camera.country,
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

  // Helper method to reset data source properly
  private resetDataSource(): void {
    this.dataSource.data = [];
    // Re-apply connections after reset
    setTimeout(() => {
      this.ensureDataSourceConnections();
    });
  }

  // Helper method to ensure data source connections are maintained
  private ensureDataSourceConnections(): void {
    if (this.sort && this.dataSource.sort !== this.sort) {
      this.dataSource.sort = this.sort;
    }
    if (this.paginator && this.dataSource.paginator !== this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  // Helper methods to get developer and project names
  getDeveloperName(developerId: string): string {
    const developer = this.developers.find(dev => dev._id === developerId);
    return developer?.developerName || 'Unknown Developer';
  }

  getProjectName(projectId: string): string {
    const project = this.projects.find(proj => proj._id === projectId);
    return project?.projectName || 'Unknown Project';
  }

  // Method to get current displayed columns based on selection
  getCurrentDisplayedColumns(): string[] {
    return this.selectedDeveloperId ? this.displayedColumns : this.allDevelopersDisplayedColumns;
  }

  openCameraInstallationDialog(camera: Camera): void {
    const dialogRef = this.dialog.open(CameraInstallationDialogComponent, {
      data: { camera },
      width: '300px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        this.snackBar.open('Camera installation date updated successfully!', 'Close', {
          duration: 3000
        });
        // Refresh the camera list to show updated data
        if (this.selectedDeveloperId) {
          this.loadCameras();
        } else {
          this.loadAllCameras();
        }
      }
    });
  }
}
