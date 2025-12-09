import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-unassign-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './unassign-dialog.component.html',
  styleUrls: ['./unassign-dialog.component.css']
})
export class UnassignDialogComponent {
  unassignForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<UnassignDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.unassignForm = this.fb.group({
      reason: ['', Validators.required]
    });
  }

  onUnassign(): void {
    if (this.unassignForm.valid) {
      this.dialogRef.close(this.unassignForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}