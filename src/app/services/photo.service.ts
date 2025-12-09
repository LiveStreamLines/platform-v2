import { Injectable } from '@angular/core';
import { environment } from '../../environment/environments';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';  // To access the auth token


@Injectable({
  providedIn: 'root',
})
export class PhotoService {
  private apiUrl = environment.backend + '/api/video/';

  constructor(private http: HttpClient, private authService: AuthService) {}

  generatePhoto(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}photoGen`, formData);
  }
}
