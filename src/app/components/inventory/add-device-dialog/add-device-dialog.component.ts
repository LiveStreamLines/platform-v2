import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DeviceTypeService } from '../../../services/device-type.service';
import { DeviceType } from '../../../models/device-type.model';

@Component({
  selector: 'app-add-device-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatSelectModule, MatInputModule],
  templateUrl: './add-device-dialog.component.html',
  styleUrl: './add-device-dialog.component.css'
})
export class AddDeviceDialogComponent implements OnInit {
  deviceForm: FormGroup;
  deviceTypes: DeviceType[] = [];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddDeviceDialogComponent>,
    private deviceTypeService: DeviceTypeService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.deviceForm = this.fb.group({
      type: ['', Validators.required],
      serialNumber: ['', Validators.required],
      model: ['']
    });
  }

  ngOnInit(): void {
    this.loadDeviceTypes();
  }

  loadDeviceTypes(): void {
    this.deviceTypeService.getAll().subscribe(types => {
      this.deviceTypes = types.filter(type => type.isActive);
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.deviceForm.valid) {
      this.dialogRef.close(this.deviceForm.value);
    }
  }
}
