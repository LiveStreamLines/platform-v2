// device-type-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DeviceType } from '../../../../models/device-type.model';

@Component({
  selector: 'app-device-type-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule
  ],
  templateUrl: './device-type-dialog.component.html',
  styleUrls: ['./device-type-dialog.component.css']
})
export class DeviceTypeDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<DeviceTypeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { isEdit: boolean, deviceType?: DeviceType }
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      validityDays: ['', [Validators.required, Validators.min(1)]],
      isActive: [true]
    });

    if (data.isEdit && data.deviceType) {
      this.form.patchValue(data.deviceType);
    }
  }

  onSave(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}