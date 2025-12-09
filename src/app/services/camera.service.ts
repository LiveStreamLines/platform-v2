import { Injectable } from '@angular/core';
import { environment } from '../../environment/environments';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Camera } from '../models/camera.model';
import { AuthService } from './auth.service';  // To access the auth token

@Injectable({
  providedIn: 'root'
})
export class CameraService {
  
  private apiUrl =   environment.backend + '/api/cameras/';
  private cameras: Camera[] = [];
  private camerasLoaded = false;

  constructor(private http: HttpClient, private authService: AuthService) {}


   getAllCameras(): Observable<Camera[]> {
      const authh = this.authService.getAuthToken();  // Get auth token from AuthService
      // Set the custom header with the authh token
      const headers = new HttpHeaders({
        'Authorization': authh ? `Bearer ${authh}` : ''  // Send authh header
      });
      return this.http.get<Camera[]>(this.apiUrl, { headers }).pipe(
          tap((data)=> {
            this.cameras = data;
            this.camerasLoaded = true;
          })
        );
      //}
    }

    getCameraById2(cameraId?: string): Observable<Camera | null> {
        // If we already have projects loaded
        if (this.camerasLoaded) {
          const camera = this.cameras.find(d => d._id === cameraId) || null;
          return of(camera);
        }
        
        // If projects array is empty, load them first
        return this.getAllCameras().pipe(
          map(() => {
            return this.cameras.find(d => d._id === cameraId) || null;
          })
        );
      }

      getCameraByTag2(cameraTag?: string): Observable<Camera | null> {
        // If we already have projects loaded
        if (this.camerasLoaded) {
          const camera = this.cameras.find(d => d.camera === cameraTag) || null;
          return of(camera);
        }
        
        // If projects array is empty, load them first
        return this.getAllCameras().pipe(
          map(() => {
            return this.cameras.find(d => d.camera === cameraTag) || null;
          })
        );
      }

  // Fetch cameras by project ID
  getCamerasByProject(projectId: string): Observable<Camera[]> {
    const authh = this.authService.getAuthToken();  // Get the auth token from AuthService
    // Set the custom header with the authh token
    const headers = new HttpHeaders({
      'Authorization': authh ? `Bearer ${authh}` : ''  // Send authh header
    });
    
    return this.http.get<any>(`${this.apiUrl}proj/${projectId}`, { headers }).pipe(
      map((response) => response)  // Extract only the 'cameras' array
      // tap((data) => {
      //   this.cameras = data;  // Store the list of project
      // })
    );
  }

  getCamerasByProjectTag(projectId: string): Observable<Camera[]> {
    const authh = this.authService.getAuthToken();  // Get the auth token from AuthService
    // Set the custom header with the authh token
    const headers = new HttpHeaders({
      'Authorization': authh ? `Bearer ${authh}` : ''  // Send authh header
    });
    
    return this.http.get<any>(`${this.apiUrl}projtag/${projectId}`, { headers }).pipe(
      map((response) => response)  // Extract only the 'cameras' array
      // tap((data) => {
      //   this.cameras = data;  // Store the list of project
      // })
    );
  }

  getCameraById(cameraId: string) {
    const authh = this.authService.getAuthToken(); 
    const headers = new HttpHeaders({ 
      'Authorization': authh ? `Bearer ${authh}` : ''  // Send authh header
    });
    return this.http.get<Camera>(`${this.apiUrl}/${cameraId}`, { headers });
  }

  getLastPicture():  Observable<any[]>  {
    const authh = this.authService.getAuthToken(); 
    const headers = new HttpHeaders({ 
      'Authorization': authh ? `Bearer ${authh}` : ''  // Send authh header
    });
    return this.http.get<any[]>(`${this.apiUrl}pics/last`,{ headers });
  }

  addOrUpdateProject(formData: FormData, isEditMode: boolean, projectId?: string): Observable<any> {
    const authh = this.authService.getAuthToken(); 
    const headers = new HttpHeaders({ 
      'Authorization': authh ? `Bearer ${authh}` : ''  // Send authh header
    });
    if (isEditMode && projectId) {
      return this.http.put(`${this.apiUrl}/${projectId}`, formData, { headers });
    } else {
      return this.http.post(`${this.apiUrl}/`, formData, { headers });
    }
  }

  addCamera(formData: FormData){
    const authh = this.authService.getAuthToken(); 
    const headers = new HttpHeaders({ 
      'Authorization': authh ? `Bearer ${authh}` : ''  // Send authh header
    });
    return this.http.post(`${this.apiUrl}/`, formData, { headers });
  }

  updateCamera(cameraId: any, formData: FormData){
    const authh = this.authService.getAuthToken(); 
    const headers = new HttpHeaders({ 
      'Authorization': authh ? `Bearer ${authh}` : ''  // Send authh header
    });
    return this.http.put(`${this.apiUrl}/${cameraId}`, formData, { headers });
  }

  updateCameraStatus(cameraId: string, data: any): Observable<any> {
    const authh = this.authService.getAuthToken(); 
    const headers = new HttpHeaders({ 
      'Authorization': authh ? `Bearer ${authh}` : ''  // Send authh header
    });
    return this.http.put(`${this.apiUrl}/${cameraId}`, data, { headers });
  }

  updateCameraInstallationDate(cameraId: string, installedDate: Date): Observable<any> {
    const authh = this.authService.getAuthToken(); 
    const headers = new HttpHeaders({ 
      'Authorization': authh ? `Bearer ${authh}` : ''  // Send authh header
    });
    return this.http.put(`${this.apiUrl}/${cameraId}/install`, { installedDate }, { headers });
  }

  updateCameraInvoiceInfo(cameraId: string, invoiceData: {
    invoiceNumber: string;
    invoiceSequence: number;
    amount: number;
    duration: number;
    generatedDate: Date;
    status: 'Pending' | 'Paid' | 'Overdue';
  }): Observable<any> {
    const authh = this.authService.getAuthToken(); 
    const headers = new HttpHeaders({ 
      'Authorization': authh ? `Bearer ${authh}` : ''  // Send authh header
    });
    return this.http.put(`${this.apiUrl}/${cameraId}/invoice`, invoiceData, { headers });
  }

  updateCameraInvoicedDuration(cameraId: string, invoicedDuration: number): Observable<any> {
    const authh = this.authService.getAuthToken(); 
    const headers = new HttpHeaders({ 
      'Authorization': authh ? `Bearer ${authh}` : ''  // Send authh header
    });
    return this.http.put(`${this.apiUrl}/${cameraId}/invoiced-duration`, { invoicedDuration }, { headers });
  }
}
