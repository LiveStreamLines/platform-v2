import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { ServiceRequest } from '../../../models/customer/service.model';

@Component({
  selector: 'app-services-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './services-list.component.html',
  styleUrl: './services-list.component.css'
})
export class ServicesListComponent implements OnInit {
  services: ServiceRequest[] = [];
  isLoading = true;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadServices();
  }

  loadServices() {
    this.api.get<ServiceRequest[]>('/service-requests').subscribe({
      next: (services) => {
        this.services = services;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load services', err);
        this.isLoading = false;
      }
    });
  }
}

