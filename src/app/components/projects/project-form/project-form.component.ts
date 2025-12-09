import { Component, Inject, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Project } from '../../../models/project.model';
import { ProjectService } from '../../../services/project.service';
import { DeveloperService } from '../../../services/developer.service';
import { Developer } from '../../../models/developer.model';
import { environment } from '../../../../environment/environments';


@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDialogModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './project-form.component.html',
  styleUrls: ['./project-form.component.css']
})
export class ProjectFormComponent implements OnInit {
  projectForm!: FormGroup;  
  developers: Developer[] = []; // Array to hold developers
  @Input() isEditMode: boolean = false;
  logoPreview: string | ArrayBuffer | null = null;
  logoFile: File | null = null;

  constructor(
    private fb: FormBuilder, 
    private projectService: ProjectService,
    private developerService: DeveloperService,
    private dialogRef: MatDialogRef<ProjectFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      console.log('ProjectFormComponent constructor - data received:', data);
      this.isEditMode = data.isEditMode;
      console.log('isEditMode set to:', this.isEditMode);
    }

  ngOnInit(): void {
    console.log('ProjectFormComponent ngOnInit - data:', this.data);
    console.log('isEditMode in ngOnInit:', this.isEditMode);
    
    this.projectForm = this.fb.group({
      projectName: ['', Validators.required],
      projectTag: ['', Validators.required],
      description: ['', Validators.required],
      developerId: ['', Validators.required],
      index:['0', Validators.required],
      isActive: [true],
      status: [this.isEditMode ? '' : 'new', Validators.required]
    });

    this.fetchDevelopers();

    if (!this.isEditMode && this.data.developerId) {
      console.log('Setting developerId in create mode:', this.data.developerId);
      this.projectForm.patchValue({ developerId: this.data.developerId });
      // Disable developer field when pre-selected in create mode
      this.projectForm.get('developerId')?.disable();
    }

    if (this.isEditMode && this.data.project) {
      console.log('Populating form with project data:', this.data.project);
      this.populateForm(this.data.project);
      // Disable developer field in edit mode to prevent changing the relationship
      this.projectForm.get('developerId')?.disable();
      
      // If developerId is also passed, ensure the field is disabled
      if (this.data.developerId) {
        console.log('Developer field disabled due to developerId:', this.data.developerId);
        this.projectForm.get('developerId')?.disable();
      }
    }
  }

  fetchDevelopers(): void {
    this.developerService.getAllDevelopers().subscribe({
      next: (developers) => (this.developers = developers),
      error: (error) => console.error('Error fetching developers:', error),
    });
  }

  populateForm(project: Project): void {
    this.projectForm.patchValue({
      projectName: project.projectName,
      projectTag: project.projectTag,
      description: project.description,
      developerId: project.developer,
      index: project.index,
      isActive: project.isActive,
      status: project.status
    });
    this.logoPreview = environment.backend +'/' + project.logo;
  }

  onLogoChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.logoFile = input.files[0];
      
      // Generate a preview
      const reader = new FileReader();
      reader.onload = () => {
        this.logoPreview = reader.result;
      };
      reader.readAsDataURL(this.logoFile);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.projectForm.valid) {
      // Temporarily enable disabled fields to get their values
      const developerIdControl = this.projectForm.get('developerId');
      const wasDisabled = developerIdControl?.disabled;
      if (wasDisabled) {
        developerIdControl?.enable();
      }

      const projectData = this.projectForm.value;
  
      const formData = new FormData();
      formData.append('projectName', projectData.projectName);
      formData.append('projectTag', projectData.projectTag);
      formData.append('description', projectData.description);
      formData.append('developer', projectData.developerId);
      formData.append('index', projectData.index);
      formData.append('isActive', projectData.isActive);
      formData.append('status', projectData.status);

      if (this.logoFile) {
        formData.append('logo', this.logoFile);
      } else if (this.isEditMode && this.data.project.logo) {
        formData.append('logo', this.data.project.logo);
      }

      // Re-disable the field if it was disabled
      if (wasDisabled) {
        developerIdControl?.disable();
      }
  
      console.log(formData.getAll.toString());
      // Call service method to submit the data
      this.projectService.addOrUpdateProject(formData, this.isEditMode, this.data?.project?._id).subscribe(
      {
        next: (response) => {
          console.log('Project submitted successfully:', response);
          // Return proper format for the sales order form
          this.dialogRef.close({
            success: true,
            project: response
          });
        },
        error: (error) => {
          console.error('Error submitting project:', error);
        }
      });
    }
  }
}
