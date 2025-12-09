import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InventoryItem } from '../models/inventory.model';
import { environment } from '../../environment/environments';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  //private apiUrl = 'http://localhost:5000/api/inventory'; // Use environment.ts for production
  private apiUrl = `${environment.backend}/api/inventory`;
  
//  private apiUrl = 'api/inventory'; // Adjust to your API endpoint

  constructor(private http: HttpClient) {}

  getAll(): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(this.apiUrl);
  }

  getById(id: string): Observable<InventoryItem> {
    // const authh = this.authService.getAuthToken();
    // const headers = new HttpHeaders({
    //   'Authorization': authh ? `Bearer ${authh}` : ''
    // });
    return this.http.get<InventoryItem>(`${this.apiUrl}/${id}`);
  }

  create(item: Partial<InventoryItem>): Observable<InventoryItem> {
    return this.http.post<InventoryItem>(this.apiUrl, item);
  }

  update(id: string, item: Partial<InventoryItem>): Observable<InventoryItem> {
    // const authToken = this.authService.getAuthToken();
    // const headers = new HttpHeaders({
    //   'Authorization': authToken ? `Bearer ${authToken}` : ''
    // });
    
    return this.http.put<InventoryItem>(`${this.apiUrl}/${id}`, item);
  }

  assignItem(itemId: string, assignment: any): Observable<InventoryItem> {
    return this.http.patch<InventoryItem>(`${this.apiUrl}/assign/${itemId}`, assignment);
  }

  assignUserToItem(itemId: string, userAssignment: any): Observable<InventoryItem> {
    return this.http.patch<InventoryItem>(`${this.apiUrl}/assign-user/${itemId}`, userAssignment);
  }

  unassignItem(itemId: string, reason: string) {
    return this.http.patch<InventoryItem>(`${this.apiUrl}/unassign/${itemId}`, { reason });
  }

  unassignUserFromItem(itemId: string, reason: string) {
    return this.http.patch<InventoryItem>(`${this.apiUrl}/unassign-user/${itemId}`, { reason });
  }

  removeAssignment(itemId: string): Observable<InventoryItem> {
    return this.http.patch<InventoryItem>(`${this.apiUrl}/${itemId}/remove`, {});
  }

  retireItem(itemId: string): Observable<InventoryItem> {
    return this.http.patch<InventoryItem>(`${this.apiUrl}/${itemId}/retire`, {});
  }
}