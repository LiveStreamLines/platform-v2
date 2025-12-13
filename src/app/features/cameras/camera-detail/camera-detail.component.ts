import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Camera } from '../../../models/customer/camera.model';

@Component({
  selector: 'app-camera-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './camera-detail.component.html',
  styleUrl: './camera-detail.component.css'
})
export class CameraDetailComponent implements OnInit {
  camera: Camera | null = null;
  isLoading = true;
  activeTab = 'live';

  constructor(
    private route: ActivatedRoute,
    private api: ApiService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCamera(id);
    }
  }

  loadCamera(id: string) {
    this.api.get<Camera>(`/cameras/${id}`).subscribe({
      next: (camera) => {
        this.camera = camera;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load camera', err);
        this.isLoading = false;
      }
    });
  }

  setTab(tab: string) {
    this.activeTab = tab;
  }
}

