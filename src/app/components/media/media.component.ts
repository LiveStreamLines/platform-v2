import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms'; // <-- Import this
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { DeveloperService } from '../../services/developer.service';
import { ProjectService } from '../../services/project.service';
import { MediaService } from '../../services/media.service';

@Component({
  selector: 'app-media',
  standalone: true,
  imports: [
    CommonModule, 
    MatNativeDateModule, 
    ReactiveFormsModule,
    MatFormFieldModule, 
    MatInputModule, 
    MatSelectModule, 
    MatButtonModule, 
    MatDatepickerModule, 
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatIcon
  ],
  templateUrl: './media.component.html',
  styleUrl: './media.component.css'
})
export class MediaComponent {
  mediaForm: FormGroup;
  developers: any[] = [];
  projects: any[] = [];
  services: string[] = [
    'Drone Shooting',
    'LSL Videos',
    'Site Photography & Videography',
    '360 Photography & Videography',
    'Satellite Imagery'
  ];
  files_List: File[] = [];
  uploadProgress: number = 0;
  uploadSuccess: boolean = false; 
  isUploading: boolean = false; // Track upload state
  isProcessing: boolean = false; // Track S3 upload processing


  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private developerService: DeveloperService,
    private projectService: ProjectService,
    private mediaService: MediaService
  ) {
    const today = new Date(); // Get the current date
    this.mediaForm = this.fb.group({
      developer: ['', Validators.required],
      project: this.fb.control({ value: '', disabled: true }, Validators.required),
      service: ['', Validators.required],
      date: [today.toISOString().split('T')[0], Validators.required],
      files: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.fetchDevelopers();
    this.mediaForm.get('developer')?.valueChanges.subscribe(developerId => {
      if (developerId) {
        this.fetchProjects(developerId);
      } else {
        // If developer is cleared, disable and reset project
        this.mediaForm.get('project')?.disable();
        this.mediaForm.get('project')?.reset();
        this.projects = [];
      }
    });
  }

  fetchDevelopers(): void {
      this.developerService.getAllDevelopers().subscribe({
        next: (developers) => (this.developers = developers),
        error: (error) => console.error('Error fetching developers:', error),
      });
  }

  fetchProjects(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.mediaForm.get('project')?.reset();
    this.mediaForm.get('project')?.disable();
    if (target && target.value) {
      const developerId = target.value;
      this.loadProjectsByDeveloper(developerId);
    } else {
      this.projects = [];
    }
  }


  loadProjectsByDeveloper(developerId: string): void {
    this.projectService.getProjectsByDeveloper(developerId).subscribe({
      next: projects => {
        this.projects = projects;
        if (projects.length > 0) {
          this.mediaForm.get('project')?.enable();
        } else {
          this.mediaForm.get('project')?.disable();
        }
      },
      error: err => {
        console.error('Error fetching projects:', err);
        this.mediaForm.get('project')?.disable();
      }
    });
  }
 
  onFileChange(event: any): void {
    const selectedFiles = Array.from(event.target.files) as File[];
    this.files_List.push(...selectedFiles); // Add new files to the array
    this.mediaForm.patchValue({ files: this.files_List }); // Update form control
  }

  submitForm(): void {
    if (this.mediaForm.invalid || this.files_List.length === 0) {
      return;
    }

    this.isUploading = true; // Mark upload as in progress
    this.uploadProgress = 0; // Initialize progress at 0

    const formData = new FormData();
    formData.append('developer', this.mediaForm.get('developer')?.value);
    formData.append('project', this.mediaForm.get('project')?.value);
    formData.append('service', this.mediaForm.get('service')?.value);
    formData.append('date', this.mediaForm.get('date')?.value);

    // Append all files to the FormData
    this.files_List.forEach((file, index) => {
      formData.append('files', file, file.name); // Use 'files' as the field name
    });

    this.mediaService.submitMediaForm(formData).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress) {
          if (event.total) {
            const totalProgress = Math.round((event.loaded / event.total) * 100);
            
            if (totalProgress >= 100) {
              // HTTP upload to backend is complete (10%)
              // Now backend is processing and uploading to S3 (remaining 90%)
              this.uploadProgress = 10;
              this.isProcessing = true;
              // Animate progress from 10% to 90% during processing
              this.animateProcessingProgress();
            } else {
              // Show progress up to 10% for HTTP upload to backend
              this.uploadProgress = Math.round(totalProgress * 0.1);
              this.isProcessing = false;
            }
          } else if (event.loaded) {
            // If total is not available, show some progress
            this.uploadProgress = 5;
          }
        } else if (event.type === HttpEventType.Response) {
          // Backend has finished processing and S3 upload
          // Show 100% completion
          this.uploadProgress = 100;
          this.isProcessing = false;
          
          // Small delay to show 100% before switching to success
          setTimeout(() => {
            this.uploadSuccess = true; // Show success message
            this.uploadProgress = 0; // Reset progress
            this.isUploading = false; // Mark upload as completed
          }, 500);
        }
      },
      error: (err) => {
        console.error('Upload error:', err)
        this.isUploading = false; // Reset upload state on error
        this.isProcessing = false; // Reset processing state on error
        this.uploadProgress = 0; // Reset progress on error
      },
    });
  }

  resetForm(): void {
    const today = new Date();
    this.mediaForm.reset({
      developer: '',
      service: '',
      date: today.toISOString().split('T')[0],
      files: null
    });
    // Reset project field separately with disabled state
    this.mediaForm.get('project')?.reset('');
    this.mediaForm.get('project')?.disable();
    
    this.files_List = []; // Clear files array
    this.uploadSuccess = false; // Hide success message
    this.uploadProgress = 0; // Reset progress
    this.isUploading = false; // Reset upload state
    this.isProcessing = false; // Reset processing state
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  private animateProcessingProgress(): void {
    // Animate progress from 10% to 90% during S3 upload processing
    let currentProgress = 10;
    const targetProgress = 90;
    const interval = setInterval(() => {
      if (currentProgress < targetProgress && this.isProcessing) {
        currentProgress += 2; // Increment by 2% each interval
        if (currentProgress > targetProgress) {
          currentProgress = targetProgress;
        }
        this.uploadProgress = currentProgress;
      } else {
        clearInterval(interval);
      }
    }, 200); // Update every 200ms for smooth animation
  }

}
