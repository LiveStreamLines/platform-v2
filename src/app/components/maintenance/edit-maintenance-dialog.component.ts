import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { Maintenance, TASK_TYPES } from '../../models/maintenance.model';
import { Developer } from '../../models/developer.model';
import { Project } from '../../models/project.model';
import { Camera } from '../../models/camera.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-edit-maintenance-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatInputModule
  ],
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title>Edit Maintenance Request</h2>
      <mat-dialog-content>
        <form #editForm="ngForm">
          <!-- Read-only information -->
          <div class="info-section">
            <div class="info-column">
              <div class="info-item">
                <label>Developer:</label>
                <span>{{getDeveloperName(data.maintenance.developerId)}}</span>
              </div>
              <div class="info-item">
                <label>Project:</label>
                <span>{{getProjectName(data.maintenance.projectId)}}</span>
              </div>
              <div class="info-item">
                <label>Camera:</label>
                <span>{{getCameraName(data.maintenance.cameraId)}}</span>
              </div>
            </div>
          </div>

          <!-- Editable fields -->
          <mat-form-field appearance="fill">
            <mat-label>Task Type</mat-label>
            <mat-select [(ngModel)]="data.maintenance.taskType" name="taskType" required>
              <mat-option *ngFor="let type of taskTypes" [value]="type">
                {{type}}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="fill">
            <mat-label>Task Description</mat-label>
            <textarea matInput
                      [(ngModel)]="data.maintenance.taskDescription"
                      name="taskDescription"
                      required
                      rows="4"
                      placeholder="Enter task description"></textarea>
          </mat-form-field>

          <mat-form-field appearance="fill">
            <mat-label>Assigned Users</mat-label>
            <mat-select [(ngModel)]="data.maintenance.assignedUsers" name="assignedUsers" required multiple>
              <mat-option *ngFor="let user of data.users" [value]="user._id">
                {{user.name}} ({{user.role}})
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="fill">
            <mat-label>Status</mat-label>
            <mat-select [(ngModel)]="data.maintenance.status" name="status" required (selectionChange)="onStatusChange()">
              <mat-option *ngFor="let status of editableStatusOptions" [value]="status.value">
                {{status.label}}
              </mat-option>
            </mat-select>
          </mat-form-field>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">Cancel</button>
        <button mat-raised-button color="primary" (click)="onSave()" [disabled]="!editForm.form.valid">
          Save Changes
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      padding: 24px;
      max-width: 800px;
      width: 100%;
      background-color: #1a1a1a;
      color: #ffffff;
    }

    mat-dialog-content {
      max-height: 70vh;
      overflow-y: auto;
      padding: 0 24px;
    }

    .info-section {
      background-color: #2d2d2d;
      border-radius: 4px;
      padding: 16px;
      margin-bottom: 24px;
    }

    .info-column {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
    }

    .info-item label {
      font-size: 12px;
      color: #b0b0b0;
      margin-bottom: 4px;
      font-weight: 500;
    }

    .info-item span {
      font-size: 14px;
      color: #ffffff;
      padding: 4px 0;
    }

    mat-form-field {
      width: 100%;
      margin-bottom: 16px;
    }

    textarea {
      min-height: 100px;
      resize: vertical;
    }

    mat-dialog-actions {
      padding: 16px 24px;
      margin: 0;
      border-top: 1px solid #333333;
    }

    mat-dialog-actions button {
      margin-left: 8px;
    }

    h2[mat-dialog-title] {
      margin: 0;
      padding: 16px 24px;
      border-bottom: 1px solid #333333;
      color: #ffffff;
    }

    ::ng-deep .mat-mdc-form-field {
      .mat-mdc-text-field-wrapper {
        background-color: #2d2d2d;
      }

      .mat-mdc-form-field-label {
        color: #b0b0b0;
      }

      .mat-mdc-input-element {
        color: #ffffff;
      }

      .mat-mdc-select-value {
        color: #ffffff;
      }

      .mat-mdc-select-arrow {
        color: #b0b0b0;
      }
    }

    ::ng-deep .mat-mdc-dialog-container {
      background-color: #1a1a1a;
    }

    ::ng-deep .mat-mdc-dialog-actions {
      border-top: 1px solid #333333;
    }

    ::ng-deep .mat-mdc-select-panel {
      background-color: #2d2d2d;
      color: #ffffff;
    }

    ::ng-deep .mat-mdc-option {
      color: #ffffff;
    }

    ::ng-deep .mat-mdc-option:hover:not([disabled]) {
      background-color: rgba(255, 255, 255, 0.08);
    }

    ::ng-deep .mat-mdc-option.mat-selected {
      background-color: rgba(33, 150, 243, 0.12);
    }
  `]
})
export class EditMaintenanceDialogComponent {
  taskTypes = TASK_TYPES;
  editableStatusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  constructor(
    public dialogRef: MatDialogRef<EditMaintenanceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      maintenance: Maintenance;
      developers: Developer[];
      projects: Project[];
      cameras: Camera[];
      users: User[];
    }
  ) {}

  getDeveloperName(developerId: string | undefined): string {
    if (!developerId) return 'Unknown Developer';
    const developer = this.data.developers.find(dev => dev._id === developerId);
    return developer ? developer.developerName : 'Unknown Developer';
  }

  getProjectName(projectId: string | undefined): string {
    if (!projectId) return 'Unknown Project';
    const project = this.data.projects.find(proj => proj._id === projectId);
    return project ? project.projectName : 'Unknown Project';
  }

  getCameraName(cameraId: string | undefined): string {
    if (!cameraId) return 'Unknown Camera';
    const camera = this.data.cameras.find(cam => cam._id === cameraId);
    return camera ? camera.camera : 'Unknown Camera';
  }

  onStatusChange(): void {
    const maintenance = this.data.maintenance;
    
    switch (maintenance.status) {
      case 'pending':
        maintenance.startTime = undefined;
        maintenance.completionTime = undefined;
        maintenance.userComment = '';
        break;
        
      case 'in-progress':
        if (!maintenance.startTime) {
          maintenance.startTime = new Date().toISOString();
        }
        maintenance.completionTime = undefined;
        maintenance.userComment = '';
        break;
        
      case 'cancelled':
        maintenance.completionTime = undefined;
        maintenance.userComment = '';
        break;
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.dialogRef.close(this.data.maintenance);
  }
} 