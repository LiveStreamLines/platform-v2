import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  isCollapsed = false;

  menuItems = [
    { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/projects', icon: 'folder', label: 'Projects' },
    { path: '/live-view', icon: 'videocam', label: 'Live View' },
    { path: '/timelapse', icon: 'movie', label: 'Time-lapse' },
    { path: '/media', icon: 'photo_library', label: 'Media Library' },
    { path: '/memories', icon: 'collections', label: 'Memories' },
    { path: '/services', icon: 'build', label: 'Services' },
    { path: '/messages', icon: 'chat', label: 'Messages' },
    { path: '/about', icon: 'info', label: 'About' },
  ];

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }
}

