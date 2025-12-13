import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Project } from '../../models/customer/project.model';
import { Camera } from '../../models/customer/camera.model';
import { MediaItem } from '../../models/customer/media.model';
import { TimeLapseRequest } from '../../models/customer/timelapse.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  stats = {
    projects: 0,
    cameras: 0,
    recentTimelapses: 0,
    recentMedia: 0
  };

  recentTimelapses: TimeLapseRequest[] = [];
  recentMedia: MediaItem[] = [];
  isLoading = true;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.isLoading = true;

    // Load projects count
    this.api.get<Project[]>('/projects').subscribe({
      next: (projects) => {
        this.stats.projects = projects.length;
      }
    });

    // Load cameras count
    this.api.get<Camera[]>('/cameras').subscribe({
      next: (cameras) => {
        this.stats.cameras = cameras.length;
      }
    });

    // Load recent time-lapses
    this.api.get<TimeLapseRequest[]>('/timelapse-requests', { limit: 5 }).subscribe({
      next: (timelapses) => {
        this.recentTimelapses = timelapses;
        this.stats.recentTimelapses = timelapses.length;
        this.checkLoadingComplete();
      }
    });

    // Load recent media
    this.api.get<MediaItem[]>('/media', { limit: 8 }).subscribe({
      next: (media) => {
        this.recentMedia = media;
        this.stats.recentMedia = media.length;
        this.checkLoadingComplete();
      }
    });
  }

  checkLoadingComplete() {
    // Simple loading check - in production, use a more robust approach
    setTimeout(() => {
      this.isLoading = false;
    }, 500);
  }
}

