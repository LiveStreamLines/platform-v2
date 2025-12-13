import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-memory-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './memory-form.component.html',
  styleUrl: './memory-form.component.css'
})
export class MemoryFormComponent {
  memoryForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private router: Router
  ) {
    this.memoryForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      projectId: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.memoryForm.valid) {
      this.isSubmitting = true;
      this.api.post('/memories', this.memoryForm.value).subscribe({
        next: () => {
          this.router.navigate(['/memories']);
        },
        error: (err) => {
          console.error('Failed to create memory', err);
          this.isSubmitting = false;
        }
      });
    }
  }
}

