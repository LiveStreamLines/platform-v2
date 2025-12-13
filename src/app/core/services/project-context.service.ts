import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Project } from '../../models/customer/project.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectContextService {
  private currentProjectSubject = new BehaviorSubject<Project | null>(null);
  public currentProject$: Observable<Project | null> = this.currentProjectSubject.asObservable();

  constructor() {
    // Load from localStorage on init
    const saved = localStorage.getItem('currentProject');
    if (saved) {
      try {
        this.currentProjectSubject.next(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved project', e);
      }
    }
  }

  setCurrentProject(project: Project | null): void {
    this.currentProjectSubject.next(project);
    if (project) {
      localStorage.setItem('currentProject', JSON.stringify(project));
    } else {
      localStorage.removeItem('currentProject');
    }
  }

  getCurrentProject(): Project | null {
    return this.currentProjectSubject.value;
  }

  clearProject(): void {
    this.setCurrentProject(null);
  }
}

