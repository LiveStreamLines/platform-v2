import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Maintenance } from '../../models/maintenance.model';

@Component({
  selector: 'app-task-completion-dialog',
  template: `
    <h2 mat-dialog-title>Complete Task</h2>
    <mat-dialog-content>
      <form #completionForm="ngForm">
        <mat-form-field appearance="fill">
          <mat-label>Completion Comment</mat-label>
          <textarea matInput 
                    [(ngModel)]="comment" 
                    name="comment" 
                    required 
                    minlength="10"
                    rows="3"
                    placeholder="Please enter any comments about the completed task..."></textarea>
          <mat-error *ngIf="completionForm.form.get('comment')?.errors?.['required']">
            Comment is required
          </mat-error>
          <mat-error *ngIf="completionForm.form.get('comment')?.errors?.['minlength']">
            Comment must be at least 10 characters
          </mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button 
              color="primary" 
              (click)="onSubmit()" 
              [disabled]="!completionForm.form.valid || !comment.trim()">
        Complete Task
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-form-field {
      width: 100%;
    }
    mat-dialog-actions {
      padding: 16px 0;
    }
    mat-dialog-content {
      min-width: 400px;
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ]
})
export class TaskCompletionDialogComponent {
  comment: string = '';

  constructor(
    public dialogRef: MatDialogRef<TaskCompletionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { maintenance: Maintenance }
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.comment.trim()) {
      this.dialogRef.close({ comment: this.comment.trim() });
    }
  }
} 