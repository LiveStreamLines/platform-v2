import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Maintenance } from '../models/maintenance.model';
import { environment } from '../../environment/environments';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class MaintenanceService {
  private apiUrl = `${environment.backend}/api/maintenance`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getHeaders(): HttpHeaders {
    const authh = this.authService.getAuthToken();
    return new HttpHeaders({
      'Authorization': authh ? `Bearer ${authh}` : ''
    });
  }

  getAllMaintenance(): Observable<Maintenance[]> {
    return this.http.get<Maintenance[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getMaintenanceById(id: string): Observable<Maintenance> {
    return this.http.get<Maintenance>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  createMaintenance(maintenance: Maintenance): Observable<Maintenance> {
    return this.http.post<Maintenance>(this.apiUrl, maintenance, { headers: this.getHeaders() });
  }

  updateMaintenance(id: string, maintenance: Maintenance): Observable<Maintenance> {
    return this.http.put<Maintenance>(`${this.apiUrl}/${id}`, maintenance, { headers: this.getHeaders() });
  }

  deleteMaintenance(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  getMaintenanceByCamera(cameraId: string): Observable<Maintenance[]> {
    return this.http.get<Maintenance[]>(`${this.apiUrl}/camera/${cameraId}`, { headers: this.getHeaders() });
  }

  getMaintenanceByUser(userId: string): Observable<Maintenance[]> {
    return this.http.get<Maintenance[]>(`${this.apiUrl}/user/${userId}`, { headers: this.getHeaders() });
  }
} 