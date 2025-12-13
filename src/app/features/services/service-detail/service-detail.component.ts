import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { ServiceRequest } from '../../../models/customer/service.model';

@Component({
  selector: 'app-service-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './service-detail.component.html',
  styleUrl: './service-detail.component.css'
})
export class ServiceDetailComponent implements OnInit {
  service: ServiceRequest | null = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadService(id);
    }
  }

  loadService(id: string) {
    this.api.get<ServiceRequest>(`/service-requests/${id}`).subscribe({
      next: (service) => {
        this.service = service;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load service', err);
        this.isLoading = false;
      }
    });
  }
}

