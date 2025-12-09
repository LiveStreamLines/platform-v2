// device-type-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DeviceTypeService } from '../../../services/device-type.service';
import { DeviceType } from '../../../models/device-type.model';
import { DeviceTypeDialogComponent } from './device-type-dialog/device-type-dialog.component';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-device-type-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatCardModule,
    MatChipsModule
  ],
  templateUrl: './device-type-list.component.html',
  styleUrls: ['./device-type-list.component.css']
})
export class DeviceTypeListComponent implements OnInit {
  displayedColumns: string[] = ['name', 'validityDays', 'isActive', 'actions'];
  deviceTypes: DeviceType[] = [];

  constructor(
    private deviceTypeService: DeviceTypeService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadDeviceTypes();
  }

  loadDeviceTypes(): void {
    this.deviceTypeService.getAll().subscribe(types => {
      this.deviceTypes = types;
    });
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(DeviceTypeDialogComponent, {
      width: '400px',
      data: { isEdit: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deviceTypeService.create(result).subscribe(() => {
          this.loadDeviceTypes();
        });
      }
    });
  }

  openEditDialog(deviceType: DeviceType): void {
    const dialogRef = this.dialog.open(DeviceTypeDialogComponent, {
      width: '400px',
      data: { isEdit: true, deviceType }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && deviceType._id) {
        this.deviceTypeService.update(deviceType._id, result).subscribe(() => {
          this.loadDeviceTypes();
        });
      }
    });
  }

  deleteDeviceType(id: string): void {
    if (confirm('Are you sure you want to delete this device type?')) {
      this.deviceTypeService.delete(id).subscribe(() => {
        this.loadDeviceTypes();
      });
    }
  }
}