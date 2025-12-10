import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MediaService } from '../../services/media.service';
import { MatIcon } from '@angular/material/icon';
import { environment } from '../../../environment/environments';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-site-photo',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatIcon,
    MatButtonModule
  ],
  templateUrl: './site-photo.component.html',
  styleUrl: './site-photo.component.css'
})
export class SitePhotoComponent implements OnInit {
  media: any[] = []; 
  mediaByDate: Map<string, any[]> = new Map();
  isLoading: boolean = false;
  errorMessage: string | null = null;
  serverUrl: string = environment.images + '/media/upload';
  userRole: string | null = null;
  accessibleProjects: string[] = [];
  accessibleDevelopers: string[] = [];

  // Calendar properties
  currentDate: Date = new Date();
  calendarDays: (Date | null)[] = [];
  viewMode: 'month' | 'year' = 'month';
  monthNames: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  dayNames: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  yearMonths: { month: number; monthName: string; date: Date; mediaCount: number }[] = [];

  constructor( 
    private mediaService: MediaService, 
    private authService: AuthService,
    private router: Router
  ){}

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();
    this.accessibleProjects = this.authService.getAccessibleProjects();  
    this.accessibleDevelopers = this.authService.getAccessibleDevelopers();
    this.fetchMediaRequests();
  }

  fetchMediaRequests(): void {
    this.isLoading = true;
    this.mediaService.getmediaRequests().subscribe({
      next: (data) => {
        this.media = data
        .filter(request => 
          (this.accessibleDevelopers.includes(request.developerId) || this.accessibleDevelopers.includes('all') || this.userRole === 'Super Admin')  &&
          (this.accessibleProjects.includes(request.projectId) || this.accessibleProjects.includes('all') || this.userRole === 'Super Admin') &&
          request.service === 'Site Photography & Videography'
        )
        .map((request) => {
          // Handle both old format (string) and new format (object with url)
          const firstFile = request.files && request.files.length > 0 ? request.files[0] : null;
          let zipLink = null;
          
          if (firstFile) {
            if (typeof firstFile === 'object' && firstFile.url) {
              // New format: file object with S3 URL
              zipLink = firstFile.url;
            } else if (typeof firstFile === 'string') {
              // Old format: file path string
              zipLink = `${this.serverUrl}/${request.developerTag}/${request.projectTag}/${firstFile}`;
            }
          }
          
          return {
            developerProject: `${request.developer} (${request.project})`,
            date: request.date,
            dateKey: this.parseDateKey(request.date),
            zipLink: zipLink,
            files: request.files,
            developerTag: request.developerTag,
            projectTag: request.projectTag
          };
        });
        
        this.groupMediaByDate();
        if (this.viewMode === 'month') {
          this.generateCalendar();
        } else {
          this.generateYearView();
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load site photography requests.';
        console.error(error);
        this.isLoading = false;
      },
    });
  }

  parseDateKey(dateStr: string): string {
    // Convert YYYYMMDD to YYYY-MM-DD
    if (dateStr.length === 8) {
      const year = dateStr.substring(0, 4);
      const month = dateStr.substring(4, 6);
      const day = dateStr.substring(6, 8);
      return `${year}-${month}-${day}`;
    }
    return dateStr;
  }

  groupMediaByDate(): void {
    this.mediaByDate.clear();
    this.media.forEach(item => {
      const dateKey = item.dateKey;
      if (!this.mediaByDate.has(dateKey)) {
        this.mediaByDate.set(dateKey, []);
      }
      this.mediaByDate.get(dateKey)!.push(item);
    });
  }

  generateCalendar(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Day of week for first day (0 = Sunday, 6 = Saturday)
    const startDay = firstDay.getDay();
    
    // Total days in month
    const daysInMonth = lastDay.getDate();
    
    // Clear previous calendar
    this.calendarDays = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDay; i++) {
      this.calendarDays.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      this.calendarDays.push(new Date(year, month, day));
    }
  }

  getMediaForDate(date: Date | null): any[] {
    if (!date) return [];
    const dateKey = this.formatDateKey(date);
    return this.mediaByDate.get(dateKey) || [];
  }

  formatDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getDayNumber(date: Date | null): number {
    return date ? date.getDate() : 0;
  }

  isToday(date: Date | null): boolean {
    if (!date) return false;
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  previousMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.generateCalendar();
  }

  nextMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.generateCalendar();
  }

  previousYear(): void {
    this.currentDate = new Date(this.currentDate.getFullYear() - 1, this.currentDate.getMonth(), 1);
    this.generateYearView();
  }

  nextYear(): void {
    this.currentDate = new Date(this.currentDate.getFullYear() + 1, this.currentDate.getMonth(), 1);
    this.generateYearView();
  }

  getCurrentMonthYear(): string {
    if (this.viewMode === 'year') {
      return `${this.currentDate.getFullYear()}`;
    }
    return `${this.monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'month' ? 'year' : 'month';
    if (this.viewMode === 'month') {
      this.generateCalendar();
    } else {
      this.generateYearView();
    }
  }

  generateYearView(): void {
    const year = this.currentDate.getFullYear();
    this.yearMonths = [];
    
    for (let month = 0; month < 12; month++) {
      const monthDate = new Date(year, month, 1);
      const monthName = this.monthNames[month];
      const mediaCount = this.getMediaCountForMonth(year, month);
      
      this.yearMonths.push({
        month: month,
        monthName: monthName,
        date: monthDate,
        mediaCount: mediaCount
      });
    }
  }

  getMediaCountForMonth(year: number, month: number): number {
    let count = 0;
    const lastDay = new Date(year, month + 1, 0).getDate();
    
    for (let day = 1; day <= lastDay; day++) {
      const date = new Date(year, month, day);
      const dateKey = this.formatDateKey(date);
      const media = this.mediaByDate.get(dateKey);
      if (media && media.length > 0) {
        count += media.length;
      }
    }
    
    return count;
  }

  selectMonth(month: number): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), month, 1);
    this.viewMode = 'month';
    this.generateCalendar();
  }

  getFileUrl(item: any, file: any): string {
    // Handle both old format (string) and new format (object with url)
    if (typeof file === 'object' && file.url) {
      // New format: file object with S3 URL
      return file.url;
    } else if (typeof file === 'string') {
      // Old format: file path string
      return `${this.serverUrl}/${item.developerTag}/${item.projectTag}/${file}`;
    }
    return '';
  }

  openMediaViewer(date: Date): void {
    if (!date) return;
    const dateKey = this.formatDateKey(date);
    const mediaForDate = this.getMediaForDate(date);
    if (mediaForDate.length > 0) {
      this.router.navigate(['/media/viewer'], {
        queryParams: {
          date: dateKey,
          service: 'Site Photography & Videography'
        }
      });
    }
  }
}
