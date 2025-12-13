import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Camera } from '../../../models/customer/camera.model';

@Component({
  selector: 'app-camera-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './camera-list.component.html',
  styleUrl: './camera-list.component.css'
})
export class CameraListComponent implements OnInit {
  cameras: Camera[] = [];
  isLoading = true;
  filters = {
    status: '',
    type: '',
    projectId: ''
  };

  constructor(
    private api: ApiService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.filters.projectId = params['projectId'] || '';
      this.loadCameras();
    });
  }

  loadCameras() {
    const params: any = {};
    if (this.filters.projectId) params.projectId = this.filters.projectId;
    if (this.filters.status) params.status = this.filters.status;
    if (this.filters.type) params.type = this.filters.type;

    this.api.get<Camera[]>('/cameras', params).subscribe({
      next: (cameras) => {
        this.cameras = cameras;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load cameras', err);
        this.isLoading = false;
      }
    });
  }
}

