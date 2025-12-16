import { Injectable } from '@angular/core';
import { environment } from '../../environment/environments';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VideoRequestService {
  private apiUrl = environment.images + '/api/video'; // Use image backend

  constructor(private http: HttpClient) {}

  getVideoRequests(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/videoRequest`);
  }
}
