import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CameraService } from '../../../services/camera.service';
import { DeveloperService } from '../../../services/developer.service';
import { ProjectService } from '../../../services/project.service';
import { Camera } from '../../../models/camera.model';
import { Developer } from '../../../models/developer.model';
import { Project } from '../../../models/project.model';

@Component({
  selector: 'app-camera-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './camera-form.component.html',
  styleUrls: ['./camera-form.component.css']
})
export class CameraFormComponent implements OnInit {
  cameraForm: FormGroup;
  developers: Developer[] = [];
  projects: Project[] = [];
  filteredProjects: Project[] = [];
  selectedDeveloper!: Developer;
  selectedProject!: Project;
  isEditing = false;

  constructor(
    private fb: FormBuilder,
    private cameraService: CameraService,
    private developerService: DeveloperService,
    private projectService: ProjectService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.cameraForm = this.fb.group({
      developer: ['', Validators.required],
      project: ['', Validators.required],
      camera: ['', Validators.required],
      cameraDescription: [''],
      cindex: [0, Validators.required],
      serverFolder:[''],
      lat: ['', Validators.required],
      lng: ['', Validators.required],
      isActive: [true],
      country: ['', Validators.required],  // Added country field
      server: ['', Validators.required]    // Added server field
    });
  }

  ngOnInit(): void {
    console.log(this.isEditing);
    this.loadDevelopers();

    this.route.paramMap.subscribe(params => {
      const developerId = params.get('developerId') ?? '';
      const projectId = params.get('projectId') ?? '';
      console.log(developerId, projectId);

      if (developerId && projectId) {
        this.isEditing = true;
        this.developerService.getDeveloperById(developerId).subscribe(developer => {
          this.selectedDeveloper = developer;
          this.cameraForm.patchValue({ developer: developer._id });
        });

        this.projectService.getProjectById(projectId).subscribe(project => {
          this.selectedProject = project;
          this.cameraForm.patchValue({ project: project._id });
        });
      } else {
        this.isEditing = false;
      }

      const cameraId = this.route.snapshot.paramMap.get('id');
      if (cameraId) {
        this.cameraService.getCameraById(cameraId).subscribe(camera => {
          this.cameraForm.patchValue(camera);
          this.loadProjectsByDeveloper(camera.developer);
        });
      }
    });
  }

  loadDevelopers(): void {
    this.developerService.getAllDevelopers().subscribe({
      next: (developers) => (this.developers = developers),
      error: (error) => console.error('Error fetching developers:', error),
    });
  }

  loadProjectsByDeveloper(developerId: string): void {
    this.projectService.getProjectsByDeveloper(developerId).subscribe(projects => {
      this.projects = projects;
      this.filteredProjects = projects;
    });
  }

  onDeveloperChange(event: Event): void {
    const developerId = (event.target as HTMLSelectElement).value;
    this.loadProjectsByDeveloper(developerId);
  }

  onSubmit(): void {
    if (this.cameraForm.valid) {
      if (!this.isEditing) {
        const cameraId = this.route.snapshot.paramMap.get('id');
        this.cameraService.updateCamera(cameraId, this.cameraForm.value).subscribe({
          next: () => this.router.navigate(['/cameras']),
          error: (error) => console.error('Error submitting camera:', error)
        });
      } else {
        this.cameraService.addCamera(this.cameraForm.value).subscribe({
          next: () => this.router.navigate(['/cameras']),
          error: (error) => console.error('Error submitting camera:', error)
        });
      }
    }
  }
}
