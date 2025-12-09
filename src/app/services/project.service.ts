import { Injectable } from '@angular/core';
import { environment } from '../../environment/environments';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { Project } from '../models/project.model';
import { AuthService } from './auth.service';  // To access the auth token

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  //private apiUrl = 'https://lslcloud.com/api/main/developer';  // Base URL for fetching projects
  private apiUrl = environment.backend + '/api/projects/dev';
  private baseUrl = environment.backend + '/api/projects';
  private projects: Project[] = [];  // Store projects here
  private projectsLoaded = false;

  constructor(private http: HttpClient, private authService: AuthService) {}


  getAllProjects(): Observable<Project[]> {
    const authh = this.authService.getAuthToken();  // Get auth token from AuthService
    // Set the custom header with the authh token
    const headers = new HttpHeaders({
      'Authorization': authh ? `Bearer ${authh}` : ''  // Send authh header
    });
    return this.http.get<Project[]>(this.baseUrl, { headers }).pipe(
        tap((data)=> {
          this.projects = data;
          this.projectsLoaded = true;
        })
      );
    //}
  }
  
  // Fetch projects by developer ID
  getProjectsByDeveloper(developerId: string): Observable<Project[]> {
    const authh = this.authService.getAuthToken();  // Get the auth token from AuthService
    // Set the custom header with the authh token
    const headers = new HttpHeaders({
      'Authorization': authh ? `Bearer ${authh}` : ''  // Send authh header
    });
      return this.http.get<Project[]>(`${this.apiUrl}/${developerId}`, { headers });
  }

  getProjectsByDeveloperTag(developerTag: string): Observable<Project[]> {
    const authh = this.authService.getAuthToken();  // Get the auth token from AuthService
    // Set the custom header with the authh token
    const headers = new HttpHeaders({
      'Authorization': authh ? `Bearer ${authh}` : ''  // Send authh header
    });
      return this.http.get<Project[]>(`${this.baseUrl}/devtag/${developerTag}`, { headers });
  }

  getProjectById2(projectId?: string): Observable<Project | null> {
    // If we already have projects loaded
    if (this.projectsLoaded) {
      const project = this.projects.find(d => d._id === projectId) || null;
      return of(project);
    }
    
    // If projects array is empty, load them first
    return this.getAllProjects().pipe(
      map(() => {
        return this.projects.find(d => d._id === projectId) || null;
      })
    );
  }

  getProjectByTag2(projectTag?: string): Observable<Project | null> {
    // If we already have projects loaded
    if (this.projectsLoaded) {
      const project = this.projects.find(d => d.projectTag === projectTag) || null;
      return of(project);
    }
    
    // If projects array is empty, load them first
    return this.getAllProjects().pipe(
      map(() => {
        return this.projects.find(d => d.projectTag === projectTag) || null;
      })
    );
  }


   // Method to get developer details for editing
   getProjectById(projectId: string): Observable<Project> {
    const authh = this.authService.getAuthToken(); 
    const headers = new HttpHeaders({ 
      'Authorization': authh ? `Bearer ${authh}` : ''  // Send authh header
    });
    return this.http.get<Project>(`${this.baseUrl}/${projectId}`, { headers });
  }

  // getProjectIdByTag(developerId: string, projectTag: string): Observable<string | undefined> {
  //   if (this.projects.length > 0) {
  //     // If projects are already loaded, return the ID
  //     return of(this.findProjectIdByTag(projectTag));
  //   } else {
  //     // Otherwise, fetch projects and then find the ID
  //     return this.getProjectsByDeveloper(developerId).pipe(
  //       map(() => this.findProjectIdByTag(projectTag))
  //     );
  //   }
  // }

  getProjectIdByTag(projectTag: string): Observable<Project[]> {
    const authh = this.authService.getAuthToken(); 
    const headers = new HttpHeaders({ 
      'Authorization': authh ? `Bearer ${authh}` : ''  // Send authh header
    });

    return this.http.get<Project[]>(`${this.baseUrl}/tag/${projectTag}`, { headers });

  }

  // Get available projects for sales orders (status "new" and no sales orders associated)
  getAvailableProjectsForSalesOrder(developerId: string): Observable<Project[]> {
    const authh = this.authService.getAuthToken(); 
    const headers = new HttpHeaders({ 
      'Authorization': authh ? `Bearer ${authh}` : ''  // Send authh header
    });

    return this.http.get<Project[]>(`${this.baseUrl}/available-for-sales-order/${developerId}`, { headers });
  }

  addOrUpdateProject(formData: FormData, isEditMode: boolean, projectId?: string): Observable<any> {
    const authh = this.authService.getAuthToken(); 
    const headers = new HttpHeaders({ 
      'Authorization': authh ? `Bearer ${authh}` : ''  // Send authh header
    });
    if (isEditMode && projectId) {
      return this.http.put(`${this.baseUrl}/${projectId}`, formData, { headers });
    } else {
      return this.http.post(`${this.baseUrl}/`, formData, { headers });
    }
  }

  updateProjectStatus(projectId: string, data: any): Observable<any> {
    const authh = this.authService.getAuthToken(); 
    const headers = new HttpHeaders({ 
      'Authorization': authh ? `Bearer ${authh}` : ''  // Send authh header
    });
    return this.http.put(`${this.baseUrl}/${projectId}`, data, {headers});
  }

  // Attachment methods
  uploadProjectAttachment(projectId: string, file: File): Observable<any> {
    const authh = this.authService.getAuthToken();
    const headers = new HttpHeaders({
      'Authorization': authh ? `Bearer ${authh}` : ''
    });
    
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post(`${this.baseUrl}/${projectId}/attachments`, formData, { headers });
  }

  getProjectAttachments(projectId: string): Observable<any[]> {
    const authh = this.authService.getAuthToken();
    const headers = new HttpHeaders({
      'Authorization': authh ? `Bearer ${authh}` : ''
    });
    
    return this.http.get<any[]>(`${this.baseUrl}/${projectId}/attachments`, { headers });
  }

  deleteProjectAttachment(projectId: string, attachmentId: string): Observable<any> {
    const authh = this.authService.getAuthToken();
    const headers = new HttpHeaders({
      'Authorization': authh ? `Bearer ${authh}` : ''
    });
    
    return this.http.delete(`${this.baseUrl}/${projectId}/attachments/${attachmentId}`, { headers });
  }


  
  // Helper function to find the project ID by tag
  private findProjectIdByTag(projectTag: string): string | undefined {
    const project = this.projects.find(proj => proj.projectTag === projectTag);
    return project ? project._id : undefined;
  }
}
