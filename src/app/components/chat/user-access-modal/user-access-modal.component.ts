import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DeveloperService } from '../../../services/developer.service';
import { ProjectService } from '../../../services/project.service';
import { Developer } from '../../../models/developer.model';
import { Project } from '../../../models/project.model';
import { forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface UserAccessData {
  userId: string;
  userName: string;
  userEmail: string;
  accessibleDevelopers: string[];
  accessibleProjects: string[];
}

interface DeveloperWithProjects {
  developer: Developer;
  projects: Project[];
}

@Component({
  selector: 'app-user-access-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './user-access-modal.component.html',
  styleUrls: ['./user-access-modal.component.css']
})
export class UserAccessModalComponent implements OnInit {
  developersWithProjects: DeveloperWithProjects[] = [];
  isLoading = true;
  hasAllDevelopers = false;
  hasAllProjects = false;

  constructor(
    public dialogRef: MatDialogRef<UserAccessModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserAccessData,
    private developerService: DeveloperService,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.loadUserAccess();
  }

  loadUserAccess(): void {
    this.isLoading = true;
    
    // Check if user has access to all developers
    this.hasAllDevelopers = this.data.accessibleDevelopers.includes('all');
    this.hasAllProjects = this.data.accessibleProjects.includes('all');

    if (this.hasAllDevelopers) {
      // If user has access to all developers, load all developers and their projects
      this.developerService.getAllDevelopers().subscribe({
        next: (developers) => {
          this.loadProjectsForDevelopers(developers);
        },
        error: (error) => {
          console.error('Error loading developers:', error);
          this.isLoading = false;
        }
      });
    } else if (this.data.accessibleDevelopers.length === 0) {
      // No developers assigned
      this.isLoading = false;
    } else {
      // Load specific developers
      const developerObservables = this.data.accessibleDevelopers.map(devId =>
        this.developerService.getDeveloperById(devId).pipe(
          catchError(() => of(null))
        )
      );

      forkJoin(developerObservables).subscribe({
        next: (developers) => {
          const validDevelopers = developers.filter(dev => dev !== null) as Developer[];
          this.loadProjectsForDevelopers(validDevelopers);
        },
        error: (error) => {
          console.error('Error loading developers:', error);
          this.isLoading = false;
        }
      });
    }
  }

  loadProjectsForDevelopers(developers: Developer[]): void {
    if (developers.length === 0) {
      this.isLoading = false;
      return;
    }

    const projectObservables = developers.map(developer => {
      if (this.hasAllProjects) {
        // If user has access to all projects, get all projects for this developer
        return this.projectService.getProjectsByDeveloper(developer._id).pipe(
          map(projects => ({
            developer,
            projects
          })),
          catchError(() => of({ developer, projects: [] }))
        );
      } else {
        // Get projects for this developer and filter by accessible projects
        return this.projectService.getProjectsByDeveloper(developer._id).pipe(
          map(projects => {
            const accessibleProjects = projects.filter(project =>
              this.data.accessibleProjects.includes(project._id)
            );
            return {
              developer,
              projects: accessibleProjects
            };
          }),
          catchError(() => of({ developer, projects: [] }))
        );
      }
    });

    forkJoin(projectObservables).subscribe({
      next: (results) => {
        // Show all developers, even if they have no projects (when user has all access)
        // Otherwise, only show developers that have accessible projects
        if (this.hasAllProjects || this.hasAllDevelopers) {
          this.developersWithProjects = results;
        } else {
          this.developersWithProjects = results.filter(result => 
            result.projects.length > 0
          );
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading projects:', error);
        this.isLoading = false;
      }
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }
}

