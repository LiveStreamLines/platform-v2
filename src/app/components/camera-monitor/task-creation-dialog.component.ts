import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Maintenance } from '../../models/maintenance.model';
import { Camera } from '../../models/camera.model';
import { User } from '../../models/user.model';
import { Developer } from '../../models/developer.model';
import { Project } from '../../models/project.model';

interface DialogData {
  camera: Camera;
  users: User[];
  taskTypes: string[];
  taskType: string;
  taskDescription: string;
  assignedUsers: string[];
  developer: Developer;
  project: Project;
}

@Component({
  selector: 'app-task-creation-dialog',
  template: `
    <h2 mat-dialog-title>Create Maintenance Task</h2>
    <mat-dialog-content>
      <form #taskForm="ngForm">
        <div class="info-section">
          <div class="info-row">
            <mat-icon>business</mat-icon>
            <div class="info-content">
              <span class="info-label">Developer</span>
              <span class="info-value">{{data.developer.developerName}}</span>
              <span class="info-tag">{{data.developer.developerTag}}</span>
            </div>
          </div>
          <div class="info-row">
            <mat-icon>folder</mat-icon>
            <div class="info-content">
              <span class="info-label">Project</span>
              <span class="info-value">{{data.project.projectName}}</span>
              <span class="info-tag">{{data.project.projectTag}}</span>
            </div>
          </div>
          <div class="info-row">
            <mat-icon>videocam</mat-icon>
            <div class="info-content">
              <span class="info-label">Camera</span>
              <span class="info-value">{{data.camera.camera}}</span>
              <span class="info-tag" *ngIf="data.camera.cameraDescription">{{data.camera.cameraDescription}}</span>
            </div>
          </div>
        </div>

        <mat-form-field appearance="fill">
          <mat-label>Task Type</mat-label>
          <mat-select [(ngModel)]="data.taskType" name="taskType" required>
            <mat-option *ngFor="let type of data.taskTypes" [value]="type">{{type}}</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Task Description</mat-label>
          <textarea matInput [(ngModel)]="data.taskDescription" name="taskDescription" required rows="3"></textarea>
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Assigned Users</mat-label>
          <mat-select [(ngModel)]="data.assignedUsers" name="assignedUsers" required multiple>
            <mat-option *ngFor="let user of data.users" [value]="user._id">
              {{user.name}} ({{user.role}})
            </mat-option>
          </mat-select>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSave()" [disabled]="!taskForm.form.valid">
        Create Task
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host {
      display: block;
      background-color: #1a1a1a;
      color: #ffffff;
    }

    h2[mat-dialog-title] {
      color: #ffffff;
    }

    .info-section {
      background-color: #2d2d2d;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 24px;
    }

    .info-row {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
      padding: 8px;
      background-color: #333333;
      border-radius: 4px;
    }

    .info-row:last-child {
      margin-bottom: 0;
    }

    .info-row mat-icon {
      margin-right: 12px;
      color: #b0b0b0;
    }

    .info-content {
      display: flex;
      flex-direction: column;
    }

    .info-label {
      font-size: 12px;
      color: #b0b0b0;
      margin-bottom: 2px;
    }

    .info-value {
      font-size: 16px;
      font-weight: 500;
      color: #ffffff;
    }

    .info-tag {
      font-size: 12px;
      color: #b0b0b0;
      margin-top: 2px;
    }

    mat-form-field {
      width: 100%;
      margin-bottom: 16px;
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
  `],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class TaskCreationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<TaskCreationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    if (!this.data.assignedUsers) {
      this.data.assignedUsers = [];
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.data.taskType && this.data.taskDescription && this.data.assignedUsers.length > 0) {
      const task: Maintenance = {
        taskType: this.data.taskType,
        taskDescription: this.data.taskDescription,
        assignedUsers: this.data.assignedUsers,
        status: 'pending',
        cameraId: this.data.camera._id,
        developerId: this.data.developer._id,
        projectId: this.data.project._id,
        dateOfRequest: new Date().toISOString(),
        userComment: '' // Initialize with empty string
      };
      this.dialogRef.close(task);
    }
  }
} 