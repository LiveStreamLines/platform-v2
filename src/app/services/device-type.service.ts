// services/device-type.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DeviceType } from '../models/device-type.model';
import { environment } from '../../environment/environments';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DeviceTypeService {
  private apiUrl = `${environment.backend}/api/device-types`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getAll(): Observable<DeviceType[]> {
    return this.http.get<DeviceType[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  create(deviceType: DeviceType): Observable<DeviceType> {
    return this.http.post<DeviceType>(this.apiUrl, deviceType, { headers: this.getHeaders() });
  }

  update(id: string, deviceType: DeviceType): Observable<DeviceType> {
    return this.http.put<DeviceType>(`${this.apiUrl}/${id}`, deviceType, { headers: this.getHeaders() });
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  private getHeaders(): HttpHeaders {
    const authToken = this.authService.getAuthToken();
    return new HttpHeaders({
      'Authorization': authToken ? `Bearer ${authToken}` : ''
    });
  }
}