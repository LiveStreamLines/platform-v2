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
import { CommonModule } from '@angular/common';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { DeveloperService } from '../../services/developer.service';
import { ProjectService } from '../../services/project.service';
import { MediaService } from '../../services/media.service';

@Component({
  selector: 'app-media',
  standalone: true,
  imports: [CommonModule, MatNativeDateModule, ReactiveFormsModule ,MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatDatepickerModule, MatProgressBarModule],
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
      project: [{ value: '', disabled: true }, Validators.required],
      service: ['', Validators.required],
      date: [today.toISOString().split('T')[0], Validators.required],
      files: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.fetchDevelopers();
    this.mediaForm.get('developer')?.valueChanges.subscribe(developerId => {
      this.fetchProjects(developerId);
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
    if (target) {
      const developerId = target.value;
      this.loadProjectsByDeveloper(developerId);
    }
  }


  loadProjectsByDeveloper(developerId: string): void {
    this.projectService.getProjectsByDeveloper(developerId).subscribe({
      next: projects => {
        this.projects = projects;
        this.mediaForm.get('project')?.enable();
      },
      error: err => console.error('Error fetching projects:', err)
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
            this.uploadProgress = Math.round((event.loaded / event.total) * 100);
          }
        } else if (event.type === HttpEventType.Response) {
          this.uploadSuccess = true; // Show success message
          this.uploadProgress = 0; // Reset progress
          this.isUploading = false; // Mark upload as completed
        }
      },
      error: (err) => {
        console.error('Upload error:', err)
        this.isUploading = false; // Reset upload state on error
      },
    });
  }

  resetForm(): void {
    this.mediaForm.reset();
    this.files_List = []; // Clear files array
    this.uploadSuccess = false; // Hide success message
  }

}
