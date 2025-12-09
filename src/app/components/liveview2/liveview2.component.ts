import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../environment/environments';


@Component({
  selector: 'app-liveview2',
  standalone: true,
  imports: [],
  templateUrl: './liveview2.component.html',
  styleUrls: ['./liveview2.component.css'],
})
export class Liveview2Component {
  private apiUrl = 'http://localhost:3000/proxy';
  iframeSrc: SafeResourceUrl = "";

  elevation = 0; // Starts at 0, range [0, 3600]
  azimuth = 90; // Starts at 90, range [0, 180]
  zoom = 1; // Starts at 1, range [0, 10]

  developerTag!: string;
  projectTag!: string;

  constructor(
    private http: HttpClient,     
    private route: ActivatedRoute, 
    private sanitizer: DomSanitizer
  ) {
    this.route.params.subscribe(params => {
      this.developerTag = params['developerTag'];
      this.projectTag = params['projectTag'];
    });

    const safeurl =  `${environment.hik}/${this.projectTag}.html`;
    this.iframeSrc = this.sanitizer.bypassSecurityTrustResourceUrl(safeurl);
  }

  moveLeft(): void {
      this.azimuth -= 100; // Decrease by 10 (adjust increment as needed)
      this.updatePTZ();
  }

  moveRight(): void {
      this.azimuth += 100; // Increase by 10
      this.updatePTZ();
  }

  moveUp(): void {
    if (this.elevation > 0) {
      this.elevation -= 30; // Move closer to 0
      this.updatePTZ();
    }
  }

  moveDown(): void {
    if (this.elevation < 180) {
      this.elevation += 30; // Move closer to 180
      this.updatePTZ();
    }
  }

  zoomIn(): void {
    if (this.zoom < 100) {
      this.zoom += 10; // Increase zoom
      this.updatePTZ();
    }
  }

  zoomOut(): void {
    if (this.zoom > 0) {
      this.zoom -= 10; // Decrease zoom
      this.updatePTZ();
    }
  }

  resetToStartPosition(): void {
    this.elevation = 90;
    this.azimuth = 0;
    this.zoom = 0;
    this.updatePTZ();
  }

  updatePTZ(): void {
    const payload = {
      method: "PUT",
      url: "/ISAPI/PTZCtrl/channels/1/absolute",
      id: "bc07467acc1b4cd9bada264fab118e66",
      contentType: "application/xml",
      body: `<PTZData xmlns='http://www.isapi.org/ver20/XMLSchema' version='2.0'>
                <AbsoluteHigh>
                    <elevation>${this.elevation}</elevation>
                    <azimuth>${this.azimuth}</azimuth>
                    <absoluteZoom>${this.zoom}</absoluteZoom>
                </AbsoluteHigh>
             </PTZData>`,
    };

    this.http.post(`${this.apiUrl}`, payload).subscribe({
      next: () => console.log(`PTZ updated successfully. Ele:${this.elevation}, Azi:${this.azimuth}, zoom:${this.zoom}`),
      error: (err) => console.error('Error updating PTZ:', err),
    });
  }
  
}
