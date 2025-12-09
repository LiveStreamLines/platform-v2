import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { of } from 'rxjs';
import { map } from 'rxjs/operators';

import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { InventoryItem } from '../../models/inventory.model';
import { Assignment, UserAssignment } from '../../models/inventory.model';
import { Developer } from '../../models/developer.model';
import { Project } from '../../models/project.model';
import { Camera } from '../../models/camera.model';
import { DeviceType } from '../../models/device-type.model';
import { User } from '../../models/user.model';

import { AddDeviceDialogComponent } from './add-device-dialog/add-device-dialog.component';
import { AssignDialogComponent } from './assign-dialog/assign-dialog.component';
import { UnassignDialogComponent } from './unassign-dialog/unassign-dialog.component';
import { DeviceTypeListComponent } from './device-type-list/device-type-list.component';
import { RelocationDialogComponent } from './relocation-dialog/relocation-dialog.component';

import { InventoryService } from '../../services/inventory.service';
import { DeveloperService } from '../../services/developer.service';
import { ProjectService } from '../../services/project.service';
import { CameraService } from '../../services/camera.service';
import { DeviceTypeService } from '../../services/device-type.service';
import { UserService } from '../../services/users.service';

import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatPaginator,
    MatSortModule
  ],
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
})
export class InventoryComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  dataSource: MatTableDataSource<InventoryItem>;

  // Selected Filters
  selectedDeviceType: string | null = null;
  serialNumberSearch: string = '';
  selectedDeveloperId: string | null = null;
  selectedProjectId: string | null = null;
  selectedCameraId: string | null = null;
  selectedStatus: string | null = null;
  selectedAdminId: string | null = null;

  projectlist: Project[] = [];
  cameralist: Camera[] = [];

  developers: Developer[] = [];
  projects: Project[] = [];
  cameras: Camera[] = [];
  filteredItems: InventoryItem[] = [];

  memoryRole: string | null = '';
  userRole: string | null = '';
  inventoryRole: string | null = '';
  
  inventoryItems: InventoryItem[] = [];
  displayedColumns: string[] = [
    'deviceType',
    'serialNumber',
    'status',
    'assignment',
    'age',
    'validity',
    'actions'
  ];

  deviceTypes: DeviceType[] = [];
  validityDaysMap: { [key: string]: number } = {};

  newDevice = {
    type: '',
    serialNumber: ''
  };
  
  statusOptions = [
    { value: null, viewValue: 'All Statuses' },
    { value: 'available', viewValue: 'Available' },
    { value: 'assigned', viewValue: 'Assigned' },
    { value: 'user_assigned', viewValue: 'User Assigned' },
    { value: 'retired', viewValue: 'Retired' }
  ];

  getStatusOptions(): { value: string | null, viewValue: string }[] {
    if (this.userRole === 'Super Admin' || this.inventoryRole === 'stock') {
      return [
        { value: null, viewValue: 'All Statuses' },
        { value: 'available', viewValue: 'Available' },
        { value: 'assigned', viewValue: 'Assigned' },
        { value: 'user_assigned', viewValue: 'User Assigned' },
        { value: 'retired', viewValue: 'Retired' }
      ];
    } else if (this.inventoryRole === 'tech') {
      return [
        { value: null, viewValue: 'All Statuses' },
        { value: 'assigned', viewValue: 'Assigned' },
        { value: 'user_assigned', viewValue: 'User Assigned' }
      ];
    } else {
      return [
        { value: null, viewValue: 'All Statuses' },
        { value: 'available', viewValue: 'Available' },
        { value: 'assigned', viewValue: 'Assigned' },
        { value: 'user_assigned', viewValue: 'User Assigned' },
        { value: 'retired', viewValue: 'Retired' }
      ];
    }
  }

  isLoading = false;

  inventory: InventoryItem[] = [];
  admins: User[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private inventoryService: InventoryService,
    private developerService: DeveloperService,
    private projectService: ProjectService,
    private cameraService: CameraService,
    private authService: AuthService,
    private deviceTypeService: DeviceTypeService,
    private userService: UserService,
    public dialog: MatDialog
  ) {
    this.dataSource = new MatTableDataSource<InventoryItem>([]);
    this.dataSource.sortingDataAccessor = (item: InventoryItem, property: string) => {
      switch(property) {
        case 'deviceType': return item.device.type;
        case 'serialNumber': return item.device.serialNumber;
        case 'status': return item.status;
        case 'age': return item.ageInDays;
        case 'validity': return this.getRemainingValidity(item);
        default: return (item as any)[property];
      }
    };
  }

  ngOnInit(): void {
    this.memoryRole = this.authService.getMemoryRole() || null;
    this.userRole = this.authService.getUserRole() || null;
    this.inventoryRole = this.authService.getInventoryRole() || null;

    // Update status options based on user role
    this.statusOptions = this.getStatusOptions();

    // Add logging for role and permissions
    console.log('User Role:', this.userRole);
    console.log('Inventory Role:', this.inventoryRole);
    console.log('Permissions:');
    console.log('- Can view actions:', this.canViewActions());
    console.log('- Can assign to project:', this.canAssignToProject({} as InventoryItem));
    console.log('- Can unassign from project:', this.canUnassignFromProject({} as InventoryItem));
    console.log('- Can assign to user:', this.canAssignToUser({} as InventoryItem));
    console.log('- Can unassign from user:', this.canUnassignFromUser({} as InventoryItem));
    console.log('- Can relocate:', this.canRelocate({} as InventoryItem));
    console.log('- Can edit:', this.canEdit({} as InventoryItem));

    this.loadDeviceTypes();
    this.loadInventory();
    this.loadAdmins();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadDeviceTypes(): void {
    this.deviceTypeService.getAll().subscribe(types => {
      this.deviceTypes = types;
      // Create validityDaysMap from loaded device types
      this.validityDaysMap = types.reduce((acc, type) => {
        acc[type.name] = type.validityDays;
        return acc;
      }, {} as { [key: string]: number });
    });
  }

  loadDevelopers(): void {
    this.developerService.getAllDevelopers().subscribe(developers => {
      this.developers = developers;
    });
  }

  loadProjects(developerId: string): void {
    if (developerId) {
      this.projectService.getProjectsByDeveloper(developerId).subscribe(projects => {
        this.projects = projects;
        this.selectedProjectId = null;
        this.cameras = [];
        this.selectedCameraId = null;
        this.filterItems();
      });
    }
  }

  loadProjectlist(): void {
    //this.projectService
  }

  loadCameras(projectId: string): void {
    if (projectId) {
      this.cameraService.getCamerasByProject(projectId).subscribe(cameras => {
        this.cameras = cameras;
        this.selectedCameraId = null;
        this.filterItems();
      });
    }
  }

  filterItems(): void {
    let filtered = this.inventoryItems.filter(item => {
      const matchesDeviceType = !this.selectedDeviceType ||
        item.device.type === this.selectedDeviceType;

      const matchesSerialNumber = !this.serialNumberSearch ||
        item.device.serialNumber.toLowerCase().includes(this.serialNumberSearch.toLowerCase());
    
      const matchesDeveloper = !this.selectedDeveloperId || 
        (item.currentAssignment && item.currentAssignment.developer === this.selectedDeveloperId);
      
      const matchesProject = !this.selectedProjectId || 
        (item.currentAssignment && item.currentAssignment.project === this.selectedProjectId);
      
      const matchesCamera = !this.selectedCameraId || 
        (item.currentAssignment && item.currentAssignment.camera === this.selectedCameraId);
      
      const matchesStatus = !this.selectedStatus || 
        item.status === this.selectedStatus;

      const matchesAdmin = !this.selectedAdminId || 
        (item.currentUserAssignment && item.currentUserAssignment.userId === this.selectedAdminId);

      return matchesDeviceType && matchesSerialNumber && matchesDeveloper && 
             matchesProject && matchesCamera && matchesStatus && matchesAdmin;
    });

    this.dataSource.data = filtered;
  }

  onDeviceTypeChange(): void {
    this.filterItems();
  }

  onSerialNumberSearch(): void {
    this.filterItems();
  }
  
  onDeveloperChange(): void {
    if (!this.selectedDeveloperId) {
      this.projects = [];
      this.cameras = [];
      this.selectedProjectId = null;
      this.selectedCameraId = null;
    } else {
      this.loadProjects(this.selectedDeveloperId);
    }
    this.filterItems();
  }

  onProjectChange(): void {
    if (!this.selectedProjectId) {
      this.cameras = [];
      this.selectedCameraId = null;
    } else {
      this.loadCameras(this.selectedProjectId);
    }
    this.filterItems();
  }

  onCameraChange(): void {
    this.filterItems();
  }

  onStatusChange(): void {
    this.filterItems();
  }

  onAdminChange(): void {
    this.filterItems();
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'available': return 'primary';
      case 'assigned': return 'accent';
      case 'user_assigned': return 'accent';
      case 'retired': return 'warn';
      case 'maintenance': return '';
      case 'expiring': return '';
      case 'expired': return 'warn';
      default: return '';
    }
  }
  
  loadInventory(): void {
    this.isLoading = true;
    this.inventoryService.getAll().subscribe({
      next: (items) => {
        this.inventoryItems = items.map(item => ({
          ...item,
          ageInDays: this.calculateAgeInDays(item),
          validityDays: this.getValidityDays(item.device.type)
        }));

        // Filter items based on role
        if (this.inventoryRole === 'tech') {
          const currentUserId = this.authService.getUserId();
          this.inventoryItems = this.inventoryItems.filter(item => 
            // Show items assigned to projects
            (item.currentAssignment && item.status !== 'available' && item.status !== 'retired') ||
            // Show items assigned to this tech user
            (item.currentUserAssignment && item.currentUserAssignment.userId === currentUserId)
          );
        }

        // Load developers first, then projects and cameras
        this.loadDevelopers();
        this.filterItems();
        this.isLoading = false;
      },
      error: () => this.isLoading = false      
    });
  }

  getDeveloperName(developerId?: string): Observable<string> {
    if (!developerId) return of ('Not assigned');
    return this.developerService.getDeveloperById2(developerId).pipe(
      map(developer => developer?.developerName || 'Unkown')
    );    
  }

  getProjectName(projectId?: string): Observable<string> {
    if (!projectId) return of('Not assigned');
    return this.projectService.getProjectById2(projectId).pipe(
      map(project => project?.projectName || 'Unknown')
    );
  }

  getCameraName(cameraId?: string): Observable<string> {
    if (!cameraId) return of('Not assigned');
    return this.cameraService.getCameraById2(cameraId).pipe(
      map(camera => camera?.cameraDescription || 'Unknown')
    );      
  }

  calculateAgeInDays(item: InventoryItem): number {
    // If no assignments at all, return 0
    if (!item.currentAssignment && (!item.assignmentHistory || item.assignmentHistory.length === 0)) {
      return 0;
    }
  
    let totalDays = 0;
  
    // Calculate duration for current assignment if exists
    if (item.currentAssignment) {
      const startDate = new Date(item.currentAssignment.assignedDate);
      const endDate = new Date(); // If still assigned, use today
      totalDays += Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    }
  
    // Calculate durations for all historical assignments
    if (item.assignmentHistory && item.assignmentHistory.length > 0) {
      item.assignmentHistory.forEach(assignment => {
        const startDate = new Date(assignment.assignedDate);
        const endDate = assignment.removedDate 
          ? new Date(assignment.removedDate) 
          : new Date(); // Shouldn't happen for historical assignments, but just in case
        totalDays += Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      });
    }
  
    return totalDays;
  }
  // Update getValidityDays to handle missing types
  getValidityDays(deviceType: string): number {
    return this.validityDaysMap[deviceType] || 365; // Default to 365 days if not found
  }

  getRemainingValidity(item: InventoryItem): number {
    return item.validityDays - item.ageInDays;
  }

  openDeviceTypesDialog(): void {
    this.dialog.open(DeviceTypeListComponent, {
      width: '800px',
      maxHeight: '90vh'
    });
  }

  openAssignToUserDialog(item: InventoryItem): void {
    // Load admins first
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.admins = users.filter(user => 
          user.role === 'Admin' || user.role === 'Super Admin'
        );
        // Sort by role (Super Admin first, then Admin) and then by name
        this.admins.sort((a, b) => {
          if (a.role === b.role) {
            return a.name.localeCompare(b.name);
          }
          return a.role === 'Super Admin' ? -1 : 1;
        });

        // Open dialog after loading admins
        const dialogRef = this.dialog.open(RelocationDialogComponent, {
          width: '500px',
          data: { 
            item,
            title: 'Assign to User',
            message: 'Select a user to assign this device to'
          }
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.assignToUser(item._id!, result.adminId);
          }
        });
      },
      error: (err) => {
        console.error('Error loading admins:', err);
      }
    });
  }

  assignToUser(itemId: string, adminId: string): void {
    const userAssignment: UserAssignment = {
      userId: adminId,
      userName: this.admins.find(admin => admin._id === adminId)?.name || '',
      assignedDate: new Date(),
      notes: 'Device assigned to User'
    };

    this.inventoryService.assignUserToItem(itemId, userAssignment).subscribe(() => {
      this.loadInventory();
    });
  }

  scrapDevice(itemId: string): void {
    if (confirm('Are you sure you want to mark this device as scrapped?')) {
      this.inventoryService.retireItem(itemId).subscribe(() => {
        this.loadInventory();
      });
    }
  }

  openAddDeviceDialog(): void {
    const dialogRef = this.dialog.open(AddDeviceDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createInventoryItem(result);
      }
    });
  }

  createInventoryItem(deviceData: any): void {
    const newItem : Partial<InventoryItem> = {
      device: {
        type: deviceData.type,
        serialNumber: deviceData.serialNumber,
        model: deviceData.model || undefined
      },
      status: 'available',
      assignmentHistory: [],
      validityDays: this.getValidityDays(deviceData.type)
    };

    this.inventoryService.create(newItem).subscribe({
      next: () => this.loadInventory(),
      error: (err) => console.error('Error creating item:', err)
    });
  }

  openAssignDialog(item: InventoryItem): void {
    const dialogRef = this.dialog.open(AssignDialogComponent, {
      width: '500px',
      data: { item }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.assignDevice(item._id!, result);
      }
    });
  }

  assignDevice(itemId: string, assignment: Omit<Assignment, 'assignedDate'>): void {
    const completeAssignment: Assignment = {
      ...assignment,
      assignedDate: new Date()
    };

    // First, get the current item to check for user assignment
    this.inventoryService.getById(itemId).subscribe({
      next: (item) => {
        if (item.currentUserAssignment) {
          // If there's a current user assignment, move it to history
          const userAssignmentHistory = item.userAssignmentHistory || [];
          userAssignmentHistory.push({
            ...item.currentUserAssignment,
            removedDate: new Date(),
            notes: 'Moved to project assignment'
          });

          // First unassign the user
          this.inventoryService.unassignUserFromItem(itemId, 'Moved to project assignment').subscribe({
            next: () => {
              // Then assign to project
              this.inventoryService.assignItem(itemId, completeAssignment).subscribe(() => {
                this.loadInventory();
              });
            },
            error: (err) => console.error('Error unassigning user:', err)
          });
        } else {
          // If no user assignment, just assign to project
          this.inventoryService.assignItem(itemId, completeAssignment).subscribe(() => {
            this.loadInventory();
          });
        }
      },
      error: (err) => console.error('Error getting item:', err)
    });
  }

  openUnassignDialog(item: InventoryItem): void {
   const dialogRef = this.dialog.open(UnassignDialogComponent, {
     width: '400px',
     data: { item }
   });

   dialogRef.afterClosed().subscribe(result => {
     if (result) {
       this.unassignDevice(item._id!, result.reason);
     }
   });
  }

  unassignDevice(itemId: string, reason: string): void {
    this.inventoryService.unassignItem(itemId, reason).subscribe(() => {
      this.loadInventory();
    });
  }

  openUnassignUserDialog(item: InventoryItem): void {
    const dialogRef = this.dialog.open(UnassignDialogComponent, {
      width: '400px',
      data: { 
        item,
        title: 'Unassign User',
        message: 'Are you sure you want to unassign this device from the user?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.unassignUserFromDevice(item._id!, result.reason);
      }
    });
  }

  unassignUserFromDevice(itemId: string, reason: string): void {
    this.inventoryService.unassignUserFromItem(itemId, reason).subscribe(() => {
      this.loadInventory();
    });
  }

  retireDevice(itemId: string): void {
    this.inventoryService.retireItem(itemId).subscribe(() => {
      this.loadInventory();
    });
  }

  loadAdmins(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        if (this.userRole === 'Super Admin' || this.inventoryRole === 'stock' || this.inventoryRole === 'viewer') {
          // Super Admin, stock role, and viewer users see all admins
          this.admins = users.filter(user => 
            user.role === 'Admin' || user.role === 'Super Admin'
          );
          // Sort by role (Super Admin first, then Admin) and then by name
          this.admins.sort((a, b) => {
            if (a.role === b.role) {
              return a.name.localeCompare(b.name);
            }
            return a.role === 'Super Admin' ? -1 : 1;
          });
        } else {
          // Other users only see themselves
          const currentUserId = this.authService.getUserId();
          this.admins = users.filter(user => user._id === currentUserId);
        }
      },
      error: (err) => {
        console.error('Error loading admins:', err);
      }
    });
  }

  canViewActions(): boolean {
    if (this.userRole === 'Super Admin' || this.inventoryRole === 'stock') return true;
    if (this.inventoryRole === 'tech') return true;
    if (this.inventoryRole === 'viewer') return true;
    return false;
  }

  canAssignToProject(item: InventoryItem): boolean {
    if (this.userRole === 'Super Admin' || this.inventoryRole === 'stock') return true;
    if (this.inventoryRole === 'tech') {
      const currentUserId = this.authService.getUserId();
      return item.status === 'available' || 
             (!!item.currentUserAssignment && item.currentUserAssignment.userId === currentUserId);
    }
    return false;
  }

  canUnassignFromProject(item: InventoryItem): boolean {
    if (this.userRole === 'Super Admin' || this.inventoryRole === 'stock') return true;
    if (this.inventoryRole === 'tech') {
      return !!item.currentAssignment && !item.currentUserAssignment;
    }
    return false;
  }

  canAssignToUser(item: InventoryItem): boolean {
    return (this.inventoryRole === 'stock' || this.userRole === 'Super Admin') 
           && item.status === 'available';
  }

  canUnassignFromUser(item: InventoryItem): boolean {
    return (this.inventoryRole === 'stock' || this.userRole === 'Super Admin') 
           && !!item.currentUserAssignment;
  }

  canRelocate(item: InventoryItem): boolean {
    return (this.userRole === 'Super Admin' || this.inventoryRole === 'stock') 
           && item.status === 'available';
  }

  canEdit(item: InventoryItem): boolean {
    if (this.userRole === 'Super Admin' || this.inventoryRole === 'stock') return true;
    if (this.inventoryRole === 'viewer') return true;
    if (this.inventoryRole === 'tech') return true;
    return false;
  }
}