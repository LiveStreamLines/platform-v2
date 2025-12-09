import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BreadcrumbService {
  private breadcrumbsSubject = new BehaviorSubject<{ label: string; url?: string }[]>([]);
  breadcrumbs$ = this.breadcrumbsSubject.asObservable();

  setBreadcrumbs(breadcrumbs: { label: string; url?: string }[]) {
    this.breadcrumbsSubject.next(breadcrumbs);
  }
}
