import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';

import { of, map, Observable } from 'rxjs';

import { InventoryService } from '../../../services/inventory.service';
import { DeveloperService } from '../../../services/developer.service';
import { ProjectService } from '../../../services/project.service';
import { CameraService } from '../../../services/camera.service';
import { DeviceTypeService } from '../../../services/device-type.service';
import { AuthService } from '../../../services/auth.service';


import { InventoryItem, Assignment } from '../../../models/inventory.model';

import { AssignDialogComponent } from '../assign-dialog/assign-dialog.component';
import { UnassignDialogComponent } from '../unassign-dialog/unassign-dialog.component';
import { DeviceType } from '../../../models/device-type.model';


@Component({
  selector: 'app-edit-device',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatExpansionModule,
    MatCardModule,
    MatDialogModule,
    MatChipsModule
  ],
  templateUrl: './edit-device.component.html',
  styleUrls: ['./edit-device.component.css']
})
export class EditDeviceComponent implements OnInit {
  deviceForm: FormGroup;
  currentItem!: InventoryItem;
  deviceTypes: DeviceType[] = [];
  validityDaysMap: { [key: string]: number } = {};

  isLoading = true;

  userRole: string | null ='';
  memoryRole: string | null = '';
  inventoryRole: string | null = '';

  developers: any[] = [];
  projects: any[] = [];
  cameras: any[] = [];

  statusOptions = ['available', 'assigned', 'user_assigned', 'retired'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private inventoryService: InventoryService,
    private developerService: DeveloperService,
    private projectService: ProjectService,
    private cameraService: CameraService,
    private deviceTypeService: DeviceTypeService,
    private authService: AuthService,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {
    this.deviceForm = this.fb.group({
      type: ['', Validators.required],
      serialNumber: ['', Validators.required],
      model: [''],
      status: [{value: '', disabled: true}],
      validityDays: [{value: '', disabled: true}]
    });
  }

  ngOnInit(): void {
    this.memoryRole = this.authService.getMemoryRole();
    this.userRole = this.authService.getUserRole();
    this.inventoryRole = this.authService.getInventoryRole();
    this.loadDeviceTypes();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.inventoryService.getById(id).subscribe({
        next: (item) => {
          this.currentItem = item;
          this.deviceForm.patchValue({
            type: item.device.type,
            serialNumber: item.device.serialNumber,
            model: item.device.model || '',
            status: item.status,
            validityDays: item.validityDays
          });

          // Disable form fields for non-Super Admin and non-stock users
          if (this.userRole !== 'Super Admin' && this.inventoryRole !== 'stock') {
            this.deviceForm.get('type')?.disable();
            this.deviceForm.get('serialNumber')?.disable();
            this.deviceForm.get('model')?.disable();
            this.deviceForm.get('status')?.disable();
            this.deviceForm.get('validityDays')?.disable();
          }

          this.isLoading = false;
        },
        error: () => {
          this.router.navigate(['/inventory']);
        }
      });
    }
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

    openAssignDialog(): void {
      const dialogRef = this.dialog.open(AssignDialogComponent, {
        width: '500px',
        data: { 
          item: this.currentItem,
          developers: this.developers,
          projects: this.projects,
          cameras: this.cameras
        }
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.assignDevice(result);
        }
      });
    }
  
    assignDevice(assignment: Omit<Assignment, 'assignedDate'>): void {
      const completeAssignment: Assignment = {
        ...assignment,
        assignedDate: new Date()
      };
  
      this.inventoryService.assignItem(this.currentItem._id, completeAssignment)
        .subscribe(() => {
          this.loadDeviceData(); // Refresh the device data
        });
    }
  
    openUnassignDialog(): void {
      const dialogRef = this.dialog.open(UnassignDialogComponent, {
        width: '400px',
        data: { item: this.currentItem }
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.unassignDevice(result.reason);
        }
      });
    }
  
    unassignDevice(reason: string): void {
      this.inventoryService.unassignItem(this.currentItem._id, reason)
        .subscribe(() => {
          this.loadDeviceData(); // Refresh the device data
        });
    }

    openUnassignUserDialog(): void {
      const dialogRef = this.dialog.open(UnassignDialogComponent, {
        width: '400px',
        data: { 
          item: this.currentItem,
          title: 'Unassign From User',
          message: 'Are you sure you want to unassign this device from the user?'
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.unassignUserFromDevice(result.reason);
        }
      });
    }

    unassignUserFromDevice(reason: string): void {
      this.inventoryService.unassignUserFromItem(this.currentItem._id, reason)
        .subscribe(() => {
          this.loadDeviceData(); // Refresh the device data
        });
    }
  
    loadDeviceData(): void {
      this.inventoryService.getById(this.currentItem._id).subscribe(item => {
        this.currentItem = item;
      });
    }

  onSave(): void {
    if (this.deviceForm.valid) {
      const updatedItem: InventoryItem = {
        ...this.currentItem,
        device: {
          ...this.currentItem.device,
          type: this.deviceForm.value.type,
          serialNumber: this.deviceForm.value.serialNumber,
          model: this.deviceForm.value.model
        },
        status: this.deviceForm.value.status,
        validityDays: this.deviceForm.value.validityDays
      };

      this.inventoryService.update(this.currentItem._id, updatedItem).subscribe({
        next: () => {
          this.router.navigate(['/inventory']);
        },
        error: () => {
          // Handle error
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/inventory']);
  }

  calculateDuration(startDate: Date, endDate?: Date): number {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }

  canEdit(): boolean {
    return this.userRole === 'Super Admin' || this.inventoryRole === 'stock';
  }
}