import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environments';

export interface LiveCamera {
  _id?: string;
  id?: string;
  projectTag: string;
  name: string;
  description: string;
  image: string;
  secretKey?: string;
  serialNumber?: string;
  hikcameraId?: string;
  isActive?: boolean;
  createdDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LiveCameraService {
  private apiUrl = `${environment.backend}/api/live-camera`;

  constructor(private http: HttpClient) {}

  getAllLiveCameras(): Observable<LiveCamera[]> {
    return this.http.get<LiveCamera[]>(this.apiUrl);
  }

  getLiveCameraById(id: string): Observable<LiveCamera> {
    return this.http.get<LiveCamera>(`${this.apiUrl}/${id}`);
  }

  addLiveCamera(camera: LiveCamera): Observable<LiveCamera> {
    return this.http.post<LiveCamera>(this.apiUrl, camera);
  }

  updateLiveCamera(id: string, camera: Partial<LiveCamera>): Observable<LiveCamera> {
    return this.http.put<LiveCamera>(`${this.apiUrl}/${id}`, camera);
  }

  deleteLiveCamera(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}

