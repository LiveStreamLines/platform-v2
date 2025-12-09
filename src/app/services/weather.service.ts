import { Injectable } from '@angular/core';
import { environment } from '../../environment/environments';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  constructor(private http: HttpClient) {}

  // Method to fetch weather by time
  getWeatherByTime(time: string): Observable<any> {
    const apiUrl = environment.backend + `/api/weather?time=${time}`;
    return this.http.get<any>(apiUrl);
  }
}