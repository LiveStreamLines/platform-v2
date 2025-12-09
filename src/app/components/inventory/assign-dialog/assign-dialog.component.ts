import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DeveloperService } from '../../../services/developer.service';
import { ProjectService } from '../../../services/project.service';
import { CameraService } from '../../../services/camera.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { Developer } from '../../../models/developer.model';
import { Project } from '../../../models/project.model';
import { Camera } from '../../../models/camera.model';

@Component({
  selector: 'app-assign-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatOptionModule
  ],
  templateUrl: './assign-dialog.component.html',
  styleUrls: ['./assign-dialog.component.css']
})
export class AssignDialogComponent {
  assignForm: FormGroup;
  developers: Developer[] = [];
  projects: Project[] = [];
  cameras: Camera[] = [];

  constructor(
    private fb: FormBuilder,
    private developerService: DeveloperService,
    private projectService: ProjectService,
    private cameraService: CameraService,
    public dialogRef: MatDialogRef<AssignDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.assignForm = this.fb.group({
      developer: ['', Validators.required],
      project: ['', Validators.required],
      camera: ['', Validators.required],
      notes: ['']
    });

    this.loadDevelopers();
  }

  loadDevelopers(): void {
    this.developerService.getAllDevelopers().subscribe(developers => {
      this.developers = developers;
    });
  }

  loadProjects(developerId: string): void {
    this.projectService.getProjectsByDeveloper(developerId).subscribe(projects => {
      this.projects = projects;
      this.assignForm.get('project')?.setValue('');
      this.assignForm.get('camera')?.setValue('');
    });
  }

  loadCameras(projectId: string): void {
    this.cameraService.getCamerasByProject(projectId).subscribe(cameras => {
      this.cameras = cameras;
      this.assignForm.get('camera')?.setValue('');
    });
  }

  onAssign(): void {
    if (this.assignForm.valid) {
      this.dialogRef.close(this.assignForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}