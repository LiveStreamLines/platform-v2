import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { ProjectService } from '../../services/project.service';
import { DeveloperService } from '../../services/developer.service';
import { AuthService } from '../../services/auth.service';
import { Project } from '../../models/project.model';
import { Developer } from '../../models/developer.model';
import { BreadcrumbService } from '../../services/breadcrumb.service';
import { environment } from '../../../environment/environments';


@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss']
})
export class ProjectListComponent implements OnInit {

  projects: Project[] = [];
  developerId: any = '';
  developerTag: string = '';
  developerName: string = '';
  loading: boolean = true;
  logopath: string = environment.backend;
  userRole: string | null = null;
  filteredProjects: Project[] = [];
  accessibleProjects: string[] = []; // List of accessible project IDs

  constructor(
    private projectService: ProjectService, 
    private developerService: DeveloperService,
    private breadcrumbService: BreadcrumbService,
    private authService: AuthService,
    private route: ActivatedRoute, 
    private router: Router, 
    ) {}

  ngOnInit(): void {
     // Get the developer ID from the route parameters
    this.developerTag = this.route.snapshot.paramMap.get('developerTag')!;
    this.developerService.getDeveloperIdByTag(this.developerTag).subscribe({
      next: (developer: Developer[]) => {
        //console.log(developer);
        this.developerId = developer[0]._id;
        this.developerName = developer[0].developerName;
        console.log(this.developerName);
        // Fetch the projects for the selected developer    
        this.projectService.getProjectsByDeveloper(this.developerId).subscribe({
          next: (data: Project[]) => {
            this.projects = data.map(project => ({
              ...project,
              logo: project.logo ? this.logopath + "/" + project.logo : this.logopath + "/logos/project/image.png"
            })).sort((a, b) => a.projectName.localeCompare(b.projectName));    
             // Filter projects based on role and accessible projects
             this.filteredProjects = this.userRole === 'Super Admin' || this.accessibleProjects[0] === 'all'
             ? this.projects // Admins see all projects
             : this.projects.filter((project) =>
                 this.accessibleProjects.includes(project._id)
             );
            this.loading = false;
          },
          error: (err: any) => {
            console.error('Error fetching projects:', err);
            this.loading = false;
          },
          complete: () => {
            this.breadcrumbService.setBreadcrumbs([
              { label: 'Home ', url: '/home' },
              { label: ` ${this.developerName}` },
            ]);
             // Get user role and accessible projects
             console.log('Project under Developer ' + this.developerTag  + ' loading complete.');
          }
        });

      },
      error: (err: any) => {
        console.error(err);
      } 
    });

    this.userRole = this.authService.getUserRole();
    console.log('Current user role in project-list:', this.userRole); // Debug log to see actual role value
    this.accessibleProjects = this.authService.getAccessibleProjects();    

  }

   // This method is called when a project is clicked
   onProjectClick(project: Project): void {
    this.router.navigate([`/home/${this.developerTag}/${project.projectTag}`]);
  }

  goBack(): void {
    this.router.navigate(['/home']);  // Navigate to the developer list (home) route
  }

}
