import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CameraService } from '../../../services/camera.service';
import { Camera } from '../../../models/camera.model';

@Component({
  selector: 'app-camera-installation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule
  ],
  templateUrl: './camera-installation-dialog.component.html',
  styleUrls: ['./camera-installation-dialog.component.css']
})
export class CameraInstallationDialogComponent implements OnInit {
  installationForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private cameraService: CameraService,
    private dialogRef: MatDialogRef<CameraInstallationDialogComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { camera: Camera }
  ) {
    this.installationForm = this.fb.group({
      installedDate: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Set default date to today
    this.installationForm.patchValue({
      installedDate: new Date()
    });
  }

  onSubmit(): void {
    if (this.installationForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const installedDate = this.installationForm.value.installedDate;

      this.cameraService.updateCameraInstallationDate(this.data.camera._id, installedDate).subscribe({
        next: (updatedCamera) => {
          this.snackBar.open('Camera installation date updated successfully', 'Close', { duration: 3000 });
          this.dialogRef.close({ success: true, camera: updatedCamera });
        },
        error: (error) => {
          console.error('Error updating camera installation date:', error);
          this.errorMessage = 'Error updating camera installation date';
          this.isLoading = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.installationForm.controls).forEach(key => {
      const control = this.installationForm.get(key);
      control?.markAsTouched();
    });
  }
} 