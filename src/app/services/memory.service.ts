import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Memory } from '../models/memory.model';
import { environment } from '../../environment/environments';

@Injectable({ providedIn: 'root' })
export class MemoryService {
//  private apiUrl = 'http://localhost:5000/api/memories'; // Use environment.ts for production
  private apiUrl = `${environment.backend}/api/memories`;


  constructor(private http: HttpClient) {}

  getMemories(): Observable<Memory[]> {
    return this.http.get<Memory[]>(this.apiUrl);
  }

  getMemoryById(id:string) {
    return this.http.get<Memory>(`${this.apiUrl}/${id}`);
  }

  updateMemory(id: string, memory:Partial<Memory>): Observable<Memory>{
    return this.http.put<Memory>(`${this.apiUrl}/${id}`, memory);
  }

  
  createMemory(memory: Memory): Observable<Memory> {
    return this.http.post<Memory>(this.apiUrl, memory);
  }
}