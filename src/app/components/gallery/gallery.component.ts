import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.css'
})
export class GalleryComponent {
  
  constructor(private router: Router) {}

  navigateTo(route: string): void {
    this.router.navigate([`gallery/${route}`]);
  }


}
