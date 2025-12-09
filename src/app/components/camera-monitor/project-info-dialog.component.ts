import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Project, ProjectAttachment } from '../../models/project.model';
import { ProjectService } from '../../services/project.service';

export interface ProjectInfoDialogData {
  project: Project;
}

@Component({
  selector: 'app-project-info-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="project-info-dialog">
      <div class="dialog-header">
        <h2 mat-dialog-title>
          <mat-icon>folder</mat-icon>
          Project Information
        </h2>
        <button mat-icon-button (click)="onClose()" class="close-button">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div mat-dialog-content class="dialog-content">
        <div class="project-details">
          <mat-card class="info-card">
            <mat-card-header>
              <mat-card-title>{{data.project.projectName}}</mat-card-title>
              <mat-card-subtitle>{{data.project.projectTag}}</mat-card-subtitle>
            </mat-card-header>
            
            <mat-card-content>
              <div class="info-grid">
                <div class="info-item">
                  <label>Project Name:</label>
                  <span>{{data.project.projectName}}</span>
                </div>
                <div class="info-item">
                  <label>Project Tag:</label>
                  <span>{{data.project.projectTag}}</span>
                </div>
                <div class="info-item">
                  <label>Status:</label>
                  <span class="status-badge" [ngClass]="getStatusClass(data.project.status)">
                    {{data.project.status}}
                  </span>
                </div>
                <div class="info-item">
                  <label>Description:</label>
                  <span>{{data.project.description || 'No description available'}}</span>
                </div>
                <div class="info-item">
                  <label>Created:</label>
                  <span>{{formatDate(data.project.createdAt || data.project.createdDate)}}</span>
                </div>
                <div class="info-item">
                  <label>Updated:</label>
                  <span>{{formatDate(data.project.updatedAt || data.project.createdDate)}}</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Attachments Section -->
          <mat-card class="attachments-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>attach_file</mat-icon>
                Attachments
              </mat-card-title>
            </mat-card-header>
            
            <mat-card-content>
              <div class="attachments-section">
                <!-- File Upload -->
                <div class="upload-section">
                  <input #fileInput type="file" multiple (change)="onFileSelected($event)" style="display: none;">
                  <button mat-raised-button color="primary" (click)="fileInput.click()">
                    <mat-icon>upload</mat-icon>
                    Upload Files
                  </button>
                </div>

                <!-- New Attachments (to be uploaded) -->
                <div class="attachments-list" *ngIf="attachments.length > 0">
                  <h4>New Files to Upload:</h4>
                  <div *ngFor="let attachment of attachments; let i = index" class="attachment-item">
                    <div class="attachment-info">
                      <mat-icon>insert_drive_file</mat-icon>
                      <span class="file-name">{{attachment.name}}</span>
                      <span class="file-size">{{formatFileSize(attachment.size)}}</span>
                    </div>
                    <div class="attachment-actions">
                      <button mat-icon-button (click)="downloadAttachment(attachment)">
                        <mat-icon>download</mat-icon>
                      </button>
                      <button mat-icon-button color="warn" (click)="removeAttachment(i)">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Existing Attachments -->
                <div class="attachments-list" *ngIf="existingAttachments.length > 0">
                  <h4>Existing Attachments:</h4>
                  <div *ngFor="let attachment of existingAttachments" class="attachment-item">
                    <div class="attachment-info">
                      <mat-icon>insert_drive_file</mat-icon>
                      <span class="file-name">{{attachment.originalName}}</span>
                      <span class="file-size">{{formatFileSize(attachment.size)}}</span>
                      <span class="upload-date">{{formatDate(attachment.uploadedAt)}}</span>
                    </div>
                    <div class="attachment-actions">
                      <button mat-icon-button (click)="openExistingAttachment(attachment)" 
                              matTooltip="Open/View File">
                        <mat-icon>open_in_new</mat-icon>
                      </button>
                      <button mat-icon-button (click)="downloadAttachmentFromUrl(attachment)"
                              matTooltip="Download File">
                        <mat-icon>download</mat-icon>
                      </button>
                      <button mat-icon-button color="warn" (click)="deleteExistingAttachment(attachment._id!)"
                              matTooltip="Delete File">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>
                  </div>
                </div>

                <div *ngIf="attachments.length === 0 && existingAttachments.length === 0" class="no-attachments">
                  <mat-icon>folder_open</mat-icon>
                  <p>No attachments yet</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>

      <div mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onClose()">Close</button>
        <button mat-raised-button color="primary" (click)="saveAttachments()" [disabled]="attachments.length === 0">
          <mat-icon>save</mat-icon>
          Save Attachments
        </button>
      </div>
    </div>
  `,
  styles: [`
    .project-info-dialog {
      min-width: 600px;
      max-width: 800px;
      background-color: #1a1a1a;
      color: #ffffff;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      border-bottom: 1px solid #404040;
      background-color: #2d2d2d;
    }

    .dialog-header h2 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
      color: #ffffff;
    }

    .close-button {
      color: #b0b0b0;
    }

    .close-button:hover {
      color: #ffffff;
    }

    .dialog-content {
      padding: 24px;
      max-height: 70vh;
      overflow-y: auto;
      background-color: #1a1a1a;
    }

    .project-details {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .info-card, .attachments-card {
      background-color: #2d2d2d;
      border: 1px solid #404040;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .info-item label {
      font-weight: 500;
      color: #b0b0b0;
      font-size: 0.9rem;
    }

    .info-item span {
      color: #ffffff;
    }

    .status-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 500;
      display: inline-block;
      width: fit-content;
    }

    .status-new {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .status-active {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .status-hold {
      background-color: #fff3e0;
      color: #f57c00;
    }

    .status-finished {
      background-color: #f3e5f5;
      color: #7b1fa2;
    }

    .attachments-section {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .upload-section {
      display: flex;
      justify-content: center;
      padding: 20px;
      border: 2px dashed #404040;
      border-radius: 8px;
      background-color: #363636;
    }

    .attachments-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .attachment-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      background-color: #363636;
      border: 1px solid #404040;
      border-radius: 8px;
    }

    .attachment-info {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }

    .file-name {
      font-weight: 500;
      color: #ffffff;
    }

    .file-size {
      color: #b0b0b0;
      font-size: 0.9rem;
    }

    .attachment-actions {
      display: flex;
      gap: 4px;
      align-items: center;
    }

    .attachment-actions button {
      min-width: 40px;
      height: 40px;
    }

    .attachment-actions mat-icon {
      font-size: 18px;
      height: 18px;
      width: 18px;
    }

    .attachment-actions button {
      color: #b0b0b0;
    }

    .attachment-actions button:hover {
      background-color: #404040;
      color: #ffffff;
    }

    .attachment-actions button[color="warn"] {
      color: #f44336;
    }

    .attachment-actions button[color="warn"]:hover {
      background-color: rgba(244, 67, 54, 0.1);
      color: #f44336;
    }

    .no-attachments {
      text-align: center;
      padding: 40px;
      color: #b0b0b0;
    }

    .no-attachments mat-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      margin-bottom: 16px;
    }

    .attachments-list h4 {
      margin: 16px 0 8px 0;
      color: #ffffff;
      font-size: 1rem;
      font-weight: 500;
    }

    .upload-date {
      color: #b0b0b0;
      font-size: 0.8rem;
      margin-left: 8px;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px;
      border-top: 1px solid #404040;
      background-color: #2d2d2d;
    }

    /* Material Design Overrides for Dark Theme */
    ::ng-deep .mat-mdc-dialog-container {
      background-color: #1a1a1a !important;
      color: #ffffff !important;
    }

    ::ng-deep .mat-mdc-dialog-title {
      color: #ffffff !important;
    }

    ::ng-deep .mat-mdc-dialog-content {
      color: #ffffff !important;
    }

    ::ng-deep .mat-mdc-dialog-actions {
      background-color: #2d2d2d !important;
    }

    ::ng-deep .mat-mdc-card {
      background-color: #2d2d2d !important;
      color: #ffffff !important;
    }

    ::ng-deep .mat-mdc-card-title {
      color: #ffffff !important;
    }

    ::ng-deep .mat-mdc-card-subtitle {
      color: #b0b0b0 !important;
    }

    ::ng-deep .mat-mdc-card-content {
      color: #ffffff !important;
    }

    @media (max-width: 768px) {
      .project-info-dialog {
        min-width: 90vw;
        max-width: 95vw;
      }

      .info-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProjectInfoDialogComponent implements OnInit {
  attachments: File[] = [];
  existingAttachments: ProjectAttachment[] = [];
  isLoading = false;

  constructor(
    public dialogRef: MatDialogRef<ProjectInfoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProjectInfoDialogData,
    private snackBar: MatSnackBar,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    // Load existing attachments if any
    this.loadExistingAttachments();
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        this.attachments.push(files[i]);
      }
      this.snackBar.open(`${files.length} file(s) added`, 'Close', {
        duration: 3000
      });
    }
  }

  removeAttachment(index: number): void {
    this.attachments.splice(index, 1);
  }

  downloadAttachment(attachment: File): void {
    const url = URL.createObjectURL(attachment);
    const a = document.createElement('a');
    a.href = url;
    a.download = attachment.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  saveAttachments(): void {
    if (this.attachments.length > 0) {
      this.isLoading = true;
      let uploadCount = 0;
      const totalFiles = this.attachments.length;

      this.attachments.forEach((file, index) => {
        this.projectService.uploadProjectAttachment(this.data.project._id, file).subscribe({
          next: (response) => {
            uploadCount++;
            if (uploadCount === totalFiles) {
              this.isLoading = false;
              this.snackBar.open('All attachments uploaded successfully', 'Close', {
                duration: 3000
              });
              this.loadExistingAttachments(); // Refresh the list
              this.attachments = []; // Clear the upload list
            }
          },
          error: (error) => {
            console.error('Error uploading file:', error);
            this.isLoading = false;
            this.snackBar.open(`Error uploading ${file.name}`, 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        });
      });
    }
  }

  formatDate(date: string | Date): string {
    if (!date) return 'Not available';
    return new Date(date).toLocaleDateString();
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'new':
        return 'status-new';
      case 'active':
        return 'status-active';
      case 'on hold':
        return 'status-hold';
      case 'finished':
        return 'status-finished';
      default:
        return 'status-new';
    }
  }

  private loadExistingAttachments(): void {
    this.projectService.getProjectAttachments(this.data.project._id).subscribe({
      next: (attachments) => {
        this.existingAttachments = attachments;
      },
      error: (error) => {
        console.error('Error loading attachments:', error);
        this.snackBar.open('Error loading attachments', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  deleteExistingAttachment(attachmentId: string): void {
    this.projectService.deleteProjectAttachment(this.data.project._id, attachmentId).subscribe({
      next: () => {
        this.snackBar.open('Attachment deleted successfully', 'Close', {
          duration: 3000
        });
        this.loadExistingAttachments(); // Refresh the list
      },
      error: (error) => {
        console.error('Error deleting attachment:', error);
        this.snackBar.open('Error deleting attachment', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  downloadExistingAttachment(attachment: ProjectAttachment): void {
    // Open the attachment URL in a new tab
    window.open(attachment.url, '_blank');
  }

  openExistingAttachment(attachment: ProjectAttachment): void {
    // Open the attachment URL in a new tab for viewing
    window.open(attachment.url, '_blank');
  }

  downloadAttachmentFromUrl(attachment: ProjectAttachment): void {
    // Force download of the attachment
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.originalName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
