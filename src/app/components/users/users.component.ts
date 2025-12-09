import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, PageEvent, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { UserService } from '../../services/users.service';
import { DeveloperService } from '../../services/developer.service';
import { ProjectService } from '../../services/project.service';
import { CameraService } from '../../services/camera.service';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';



@Component({
  selector: 'app-users',
  standalone: true,
  imports: [ 
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSortModule,
    MatInputModule
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit, AfterViewInit {
  userRole: string | null = null;
  accessibleDeveloper: string[]=[];
  accessibleProject: string[]=[];
  accessibleCamera: string[]=[];
  isSuperAdmin: boolean = false;
  users : User[] = [];
  filteredUsers: User[] = [];
  displayedUsers: User[] = []; // The users to display on the current page
  pageSize: number = 5; // Default number of rows per page
  pageIndex: number = 0; // Current page index
  developers: any[] = [];
  projects: any[] = [];
  cameras: any[] = [];
  selectedRole: string = '';
  selectedDeveloperId: string | null = null;
  selectedProjectId: string | null = null;
  selectedCameraId: string | null = null;
  searchTerm: string = ''; // To hold the search term
  isLoading : boolean = true;
  
  // Sorting properties
  currentSortColumn: string = 'name';
  currentSortDirection: 'asc' | 'desc' = 'asc';

  displayedColumns: string[] = ['name', 'email', 'role', 'status', 'lastLogin', 'createdDate', 'actions'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;


 constructor(
  private userService: UserService, 
  private router: Router,
  private developerService: DeveloperService,
  private projectService: ProjectService,
  private cameraService: CameraService,
  private authService: AuthService,
  private changeDetector: ChangeDetectorRef
 ) {}

  ngOnInit(): void {
    this.isSuperAdmin = this.authService.getUserRole() === 'Super Admin';
    this.accessibleDeveloper = this.authService.getAccessibleDevelopers()!;
    this.accessibleProject = this.authService.getAccessibleProjects();
    this.accessibleCamera = this.authService.getAccessibleCameras();
    this.fetchUsers();
    this.loadDevelopers();
  }

  ngAfterViewInit() {
    // Nothing needed here anymore as we're handling pagination manually
  }

  // Fetch users from the service
  fetchUsers(): void {
    this.isLoading = true; // Set loading to true
    this.userService.getAllUsers2(this.isSuperAdmin, this.accessibleDeveloper, this.accessibleProject, this.accessibleCamera).subscribe({
      next: (users) => {
        this.users = users;
        this.filteredUsers = [...this.users]; // Initialize filtered users
        this.sortData({ active: 'name', direction: 'asc' }); // Default sort
        this.updateDisplayedUsers(); // Set initial page of users
        this.isLoading = false; // Loading complete
      },
      error: (err) => {
        console.error('Error fetching users:', err);
        this.isLoading = false; // Stop loading on error
      },
    });
  }

  // Update the displayed users based on current page and page size
  updateDisplayedUsers(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedUsers = this.filteredUsers.slice(startIndex, endIndex);
    this.changeDetector.detectChanges();
  }

  loadDevelopers(): void {
    this.isLoading = true;
    this.developerService.getAllDevelopers().subscribe((developers) => {
      if (this.isSuperAdmin || this.accessibleDeveloper[0] === 'all') {
        // Super admins see all developers including "All Developers"
        this.developers = [{ _id: 'ALL', developerName: 'All Developers' }, ...developers];
      } else {
        // Non-super admins see only their accessible developers
        this.developers = developers.filter((developer) =>
          this.accessibleDeveloper.includes(developer._id)
        );
      }

      this.isLoading = false;
      this.selectedDeveloperId = this.developers.length ? this.developers[0]._id : null;
      this.loadProjects();
    });
  }

  loadProjects(): void {
    if (this.selectedDeveloperId && this.selectedDeveloperId !== 'ALL') {
      this.isLoading = true;
      this.projectService.getProjectsByDeveloper(this.selectedDeveloperId).subscribe((projects) => {
        if (this.isSuperAdmin || this.accessibleProject[0] === 'all') {
          this.projects = [{ _id: 'ALL', projectName: 'All Projects' }, ...projects];
         } else {
          // Non-super admins see only their accessible developers
         this.projects = projects.filter((project) =>
            this.accessibleProject.includes(project._id)
          );
        }
        this.isLoading = false;
        this.selectedProjectId = this.projects.length ? this.projects[0]._id : null;
        this.loadCameras();
      });
    } else {
      this.projects = [];
      this.cameras = [];
      this.selectedProjectId = 'ALL';
      this.selectedCameraId = 'ALL';
      this.filterUsersByAccess();
    }
  }

  loadCameras(): void {
    if (this.selectedProjectId && this.selectedProjectId !== 'ALL') {
      this.isLoading = true;
      this.cameraService.getCamerasByProject(this.selectedProjectId).subscribe((cameras) => {
        if (this.isSuperAdmin || this.accessibleCamera[0] === 'all') {
          this.cameras = [{ _id: 'ALL', cameraDescription: 'All Cameras' }, ...cameras];
        } else {
           // Non-super admins see only their accessible developers
          this.cameras = cameras.filter((camera) =>
            this.accessibleCamera.includes(camera._id)
          );
        }
        this.isLoading = false;
        this.selectedCameraId = this.cameras.length ? this.cameras[0]._id : null;
        this.filterUsersByAccess();
      });
    } else {
      this.cameras = [];
      this.selectedCameraId = 'ALL';
      this.filterUsersByAccess();
    }
  }

  onDeveloperChange(): void {
    this.selectedProjectId = 'ALL';
    this.selectedCameraId = 'ALL';
    this.projects = [];
    this.cameras = [];
    this.loadProjects();
  }

  onProjectChange(): void {
    this.selectedCameraId = 'ALL';
    this.cameras = [];
    this.loadCameras();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updateDisplayedUsers();
  }

  // Manual sorting implementation
  sortData(sort: Sort) {
    console.log('Sorting by', sort.active, 'in', sort.direction, 'order');
    
    this.currentSortColumn = sort.active || 'name';
    this.currentSortDirection = (sort.direction as 'asc' | 'desc') || 'asc';
    
    if (this.filteredUsers.length > 0) {
      // Create a new sorted array to trigger change detection
      this.filteredUsers = [...this.filteredUsers].sort((a, b) => {
        const isAsc = this.currentSortDirection === 'asc';
        switch (this.currentSortColumn) {
          case 'name':
            return this.compare(a.name?.toLowerCase() || '', b.name?.toLowerCase() || '', isAsc);
          case 'email':
            return this.compare(a.email?.toLowerCase() || '', b.email?.toLowerCase() || '', isAsc);
          case 'role':
            return this.compare(a.role?.toLowerCase() || '', b.role?.toLowerCase() || '', isAsc);
          case 'status':
            // Handle the case where status might not exist on User type
            return this.compare(
              (a as any).status?.toLowerCase() || '', 
              (b as any).status?.toLowerCase() || '', 
              isAsc
            );
          case 'lastLogin':
            const lastLoginA = a.LastLoginTime ? new Date(a.LastLoginTime).getTime() : 0;
            const lastLoginB = b.LastLoginTime ? new Date(b.LastLoginTime).getTime() : 0;
            return this.compare(lastLoginA, lastLoginB, isAsc);
          case 'createdDate':
            const createdDateA = a.createdDate ? new Date(a.createdDate).getTime() : 0;
            const createdDateB = b.createdDate ? new Date(b.createdDate).getTime() : 0;
            return this.compare(createdDateA, createdDateB, isAsc);
          default:
            return 0;
        }
      });
      
      // Reset to first page
      this.pageIndex = 0;
      if (this.paginator) {
        this.paginator.pageIndex = 0;
      }
      
      // Update displayed users
      this.updateDisplayedUsers();
    }
  }

  // Comparison function for sorting
  private compare(a: any, b: any, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  filterUsersByAccess(): void {
    this.filteredUsers = this.users.filter((user) => {
      const isAdmin = user.role === 'Super Admin';
      const matchesDeveloper =
        this.selectedDeveloperId === 'ALL' 
        || user.accessibleDevelopers.includes(this.selectedDeveloperId!)
        || user.accessibleDevelopers[0] === 'all';
      const matchesProject =
        this.selectedProjectId === 'ALL' 
        || user.accessibleProjects.includes(this.selectedProjectId!)
        || user.accessibleProjects[0] === 'all'; // Include users with "all"
      const matchesCamera =
        this.selectedCameraId === 'ALL' 
        || user.accessibleCameras.includes(this.selectedCameraId!)
        || user.accessibleCameras[0] === 'all';

      if (this.isSuperAdmin || this.accessibleDeveloper[0] === "all") {
        return isAdmin || (matchesDeveloper && matchesProject && matchesCamera);
      } else {
        return (matchesDeveloper && matchesProject && matchesCamera);
      }
    });
    
    // Re-apply the current sort
    this.sortData({ active: this.currentSortColumn, direction: this.currentSortDirection });
  }

  onRoleChange(): void {
    this.filteredUsers = this.selectedRole
      ? this.users.filter(user => user.role === this.selectedRole)
      : [...this.users];
    
    // Re-apply the current sort
    this.sortData({ active: this.currentSortColumn, direction: this.currentSortDirection });
  }

  onSearch(): void {
    if (this.searchTerm.trim()) {
      // Filter users based on the search term
      this.filteredUsers = this.users.filter((user) =>
        user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
      
      // Re-apply the current sort
      this.sortData({ active: this.currentSortColumn, direction: this.currentSortDirection });
    } else {
      // If search term is empty, apply filters
      this.filterUsersByAccess();
    }
  }

  openAddUser(): void {
    this.router.navigate(['/users/add']);
  }

  openEditUser(userId: string): void {
    this.router.navigate(['/users/edit', userId]);
  }

  deleteUser(userId: number): void {
    console.log('Delete User:', userId);
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString(); // You can customize the format
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'New': return 'status-new';
      case 'Reset Password Sent': return 'status-reset';
      case 'Phone Required': return 'status-phone';
      case 'active': return 'status-active';
      default: return '';
    }
  }
}
