import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-timelapse-request',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './timelapse-request.component.html',
  styleUrl: './timelapse-request.component.css'
})
export class TimelapseRequestComponent {
  requestForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private router: Router
  ) {
    this.requestForm = this.fb.group({
      projectId: ['', Validators.required],
      cameraId: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      resolution: ['1080p'],
      overlayLogo: [false],
      notes: ['']
    });
  }

  onSubmit() {
    if (this.requestForm.valid) {
      this.isSubmitting = true;
      this.api.post('/timelapse-requests', this.requestForm.value).subscribe({
        next: () => {
          this.router.navigate(['/timelapse']);
        },
        error: (err) => {
          console.error('Failed to create request', err);
          this.isSubmitting = false;
        }
      });
    }
  }
}

