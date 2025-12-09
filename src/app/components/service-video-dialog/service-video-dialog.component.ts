import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'app-service-video-dialog',
  standalone: true,
  imports: [MatDialogModule],
  templateUrl: './service-video-dialog.component.html',
  styleUrl: './service-video-dialog.component.css'
})
export class ServiceVideoDialogComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: { title: string; videoUrl: string }) {
    console.log('Received data:', data);
  }

  ngOnInit() {
    // This ensures the video is reset when the dialog opens
    const videoElement = document.querySelector('video');
    if (videoElement) {
      videoElement.load(); // Reloads the video
    }
  }


}
