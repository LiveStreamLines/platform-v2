import { Component, Input} from '@angular/core';
import { CommonModule } from '@angular/common';  // Import CommonModule for ngFor and ngIf
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenav } from '@angular/material/sidenav';
import { AuthService } from '../../services/auth.service';  // Import the AuthService
import { BreadcrumbService } from '../../services/breadcrumb.service';
import { RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ManualVideoDialogComponent } from '../manual-video-dialog/manual-video-dialog.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports:[
    MatToolbarModule, 
    MatButtonModule, 
    MatIconModule,
    CommonModule, 
    RouterLink
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  @Input() sidenav!: MatSidenav;
  username: string | null = null;  // You can replace this with dynamic user data
  breadcrumbs: { label: string; url?: string }[] = [];

  constructor(
    private authService: AuthService,
    private breadcrumbService: BreadcrumbService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.username = this.authService.getUsername();
    this.breadcrumbService.breadcrumbs$.subscribe((breadcrumbs) => {
      this.breadcrumbs = breadcrumbs;
      //console.log(this.breadcrumbs);
    });
  }

  openManual() {
     this.dialog.open(ManualVideoDialogComponent, {
       data: { title: 'Manual', videoUrl: 'assets/videos/manual.mp4' },
       panelClass: 'fullscreen-dialog', // Add a custom class for fullscreen styling
     });
   }

 
  // Toggle the sidenav
  toggleSidenav() {
    this.sidenav.toggle();
  }

  logout() {
    this.authService.logout();  // Call the logout function in AuthService
  }
}
