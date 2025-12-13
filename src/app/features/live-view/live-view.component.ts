import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-live-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './live-view.component.html',
  styleUrl: './live-view.component.css'
})
export class LiveViewComponent {
  layout: '1' | '2' | '4' = '4';
  selectedCameras: string[] = [];

  changeLayout(layout: '1' | '2' | '4') {
    this.layout = layout;
  }

  get cameraCount(): number {
    return parseInt(this.layout, 10);
  }

  get cameraArray(): number[] {
    return [1, 2, 3, 4].slice(0, this.cameraCount);
  }
}

