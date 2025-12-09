import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environments';

export interface ServiceConfig {
  allowedTags: string[];
  allowedSite: string[];
  allowedDrone: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ServiceConfigService {
  private apiUrl = `${environment.backend}/api/service-config`;

  constructor(private http: HttpClient) {}

  getServiceConfig(): Observable<ServiceConfig> {
    return this.http.get<ServiceConfig>(this.apiUrl);
  }
}


