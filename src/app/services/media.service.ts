import { Injectable } from '@angular/core';
import { environment } from '../../environment/environments';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class MediaService {
  private apiUrl = environment.backend + '/api/media'; 

  constructor(private http: HttpClient) {}

  submitMediaForm(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData, {
      reportProgress: true,
      observe: 'events',
    });
  }

  getmediaRequests(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/request`);
  }
    
}