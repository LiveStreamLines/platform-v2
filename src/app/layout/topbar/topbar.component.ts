import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { ProjectContextService } from '../../core/services/project-context.service';
import { Project } from '../../models/customer/project.model';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css'
})
export class TopbarComponent implements OnInit {
  breadcrumbs: { label: string; path: string }[] = [];
  currentProject: Project | null = null;
  projects: Project[] = [];
  user = {
    name: '',
    email: '',
    avatar: ''
  };
  showProjectDropdown = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private projectContext: ProjectContextService,
    private api: ApiService
  ) {}

  ngOnInit() {
    // Get user info
    this.user.name = localStorage.getItem('username') || '';
    this.user.email = localStorage.getItem('useremail') || '';

    // Subscribe to current project
    this.projectContext.currentProject$.subscribe(project => {
      this.currentProject = project;
    });

    // Build breadcrumbs from route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.route),
      map(route => {
        while (route.firstChild) {
          route = route.firstChild;
        }
        return route;
      })
    ).subscribe(route => {
      this.buildBreadcrumbs(route);
    });

    // Load projects
    this.loadProjects();
  }

  buildBreadcrumbs(route: ActivatedRoute) {
    const breadcrumbs: { label: string; path: string }[] = [];
    let currentRoute = route;
    let url = '';

    while (currentRoute.firstChild) {
      currentRoute = currentRoute.firstChild;
      const routeSnapshot = currentRoute.snapshot;
      const segment = routeSnapshot.url[0]?.path;
      
      if (segment) {
        url += `/${segment}`;
        const label = this.getLabelFromSegment(segment, routeSnapshot);
        breadcrumbs.push({ label, path: url });
      }
    }

    this.breadcrumbs = breadcrumbs;
  }

  getLabelFromSegment(segment: string, snapshot: any): string {
    // Convert route segments to readable labels
    const labels: { [key: string]: string } = {
      'dashboard': 'Dashboard',
      'projects': 'Projects',
      'cameras': 'Cameras',
      'live-view': 'Live View',
      'timelapse': 'Time-lapse',
      'media': 'Media',
      'memories': 'Memories',
      'services': 'Services',
      'messages': 'Messages',
      'about': 'About'
    };

    // If it's an ID, try to get the name from route data
    if (snapshot.data && snapshot.data['title']) {
      return snapshot.data['title'];
    }

    return labels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
  }

  loadProjects() {
    this.api.get<Project[]>('/projects').subscribe({
      next: (projects) => {
        this.projects = projects;
      },
      error: (err) => {
        console.error('Failed to load projects', err);
      }
    });
  }

  selectProject(project: Project) {
    this.projectContext.setCurrentProject(project);
    this.showProjectDropdown = false;
    // Optionally navigate to project detail
    this.router.navigate(['/projects', project.id]);
  }

  logout() {
    this.authService.logout();
  }
}

