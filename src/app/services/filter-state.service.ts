import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FilterStateService {
  private developerIdSubject = new BehaviorSubject<string | null>(null);
  private projectIdSubject = new BehaviorSubject<string | null>(null);

  developerId$ = this.developerIdSubject.asObservable();
  projectId$ = this.projectIdSubject.asObservable();

  setDeveloperId(id: string | null) {
    this.developerIdSubject.next(id);
  }

  setProjectId(id: string | null) {
    this.projectIdSubject.next(id);
  }

  getDeveloperId(): string | null {
    return this.developerIdSubject.value;
  }

  getProjectId(): string | null {
    return this.projectIdSubject.value;
  }
} 