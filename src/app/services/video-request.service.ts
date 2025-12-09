import { Injectable } from '@angular/core';
import { environment } from '../../environment/environments';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VideoRequestService {
  private apiUrl = environment.backend + '/api/video'; // Replace with your backend URL

  constructor(private http: HttpClient) {}

  getVideoRequests(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/videoRequest`);
  }
}
