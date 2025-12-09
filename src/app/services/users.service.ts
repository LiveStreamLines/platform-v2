import { Injectable } from '@angular/core';
import { environment } from '../../environment/environments';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { User } from '../models/user.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = environment.backend + '/api/users'; // Base URL for the user API
  private Authurl = environment.backend + '/api/auth'; // Base URL for the user API


  constructor(private http: HttpClient, private authService: AuthService) {}

  // Get all users
  getAllUsers(): Observable<User[]> {
    const authh = this.authService.getAuthToken();  // Get auth token from AuthService
    // Set the custom header with the authh token
    const headers = new HttpHeaders({
      'Authorization': authh ? `Bearer ${authh}` : ''  // Send authh header
    });

    return this.http.get<User[]>(`${this.apiUrl}`,{ headers });
  }

  getAllUsers2( 
    SuperAdmin?: boolean,
    accessibleDevelopers?: string[],
    accessibleProjects?: string[],
    accessibleCameras?: string[]): Observable<User[]> {
    
    const authh = this.authService.getAuthToken();  // Get auth token from AuthService
    // Set the custom header with the authh token
    const headers = new HttpHeaders({
      'Authorization': authh ? `Bearer ${authh}` : ''  // Send authh header
    });

    return this.http.get<User[]>(`${this.apiUrl}`,{ headers }).pipe(
      map((users: User[]) => {
        
  
        if (SuperAdmin) return users;
  
        return users.filter((user) => {
          const matchesDeveloper =
            accessibleDevelopers?.includes('all') ||
            user.accessibleDevelopers.some(devId => accessibleDevelopers?.includes(devId));
          const matchesProject =
            accessibleProjects?.includes('all') ||
            user.accessibleProjects.some(projId => accessibleProjects?.includes(projId));
          const matchesCamera =
            accessibleCameras?.includes('all') ||
            user.accessibleCameras.some(camId => accessibleCameras?.includes(camId));
  
          return matchesDeveloper && matchesProject && matchesCamera;
        });
      })
    );
  
  }

  // Get a user by ID
  getUserById(id: string): Observable<User> {
    const authh = this.authService.getAuthToken();  // Get auth token from AuthService
    // Set the custom header with the authh token
    const headers = new HttpHeaders({
      'Authorization': authh ? `Bearer ${authh}` : ''  // Send authh header
    });
    return this.http.get<User>(`${this.apiUrl}/${id}`, { headers });
  }

  getUserByEmail(email: string): Observable<string> {
    return this.http.get<string>(`${this.Authurl}/email/${email}`);
  }

  sendResetPasswordLink(userId: string, resetEmail: string) {
    return this.http.post<string>(`${this.Authurl}/reset-link`, { user_id: userId, reset_email: resetEmail });
  }

  // Add a new user
  addUser(user: any): Observable<User> {
    const authh = this.authService.getAuthToken();  // Get auth token from AuthService
    // Set the custom header with the authh token
    const headers = new HttpHeaders({
      'Authorization': authh ? `Bearer ${authh}` : ''  // Send authh header
    });
    return this.http.post<User>(`${this.apiUrl}`, user, { headers });
  }

  // Update an existing user
  updateUser(id: string, user: Partial<User>): Observable<User> {
    const authh = this.authService.getAuthToken();  // Get auth token from AuthService
    // Set the custom header with the authh token
    const headers = new HttpHeaders({
      'Authorization': authh ? `Bearer ${authh}` : ''  // Send authh header
    });
    return this.http.put<User>(`${this.apiUrl}/${id}`, user, { headers });
  }
 
  // Delete a user
  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
