import { Component, OnInit, Input, input } from '@angular/core';
import { FormsModule } from '@angular/forms';  // Import FormsModule for ngModel
import { CommonModule } from '@angular/common'; // Import CommonModule for ngFor and ngIf
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';

@Component({
  selector: 'app-camera-compare-side',
  standalone: true,
  imports: [CommonModule, FormsModule, MatInputModule ,MatDatepickerModule],
  templateUrl: './camera-compare-side.component.html',
  styleUrl: './camera-compare-side.component.css'
})
export class CameraCompareSideComponent implements OnInit {
  @Input() inselectedDate1Picture: string = '';
  @Input() inselectedDate2Picture: string = '';
  
  loadingLeft = false;
  loadingRight = false;

 
  constructor(
    ) {}

  ngOnInit(): void {
  }

 
  onImageLoad(side: 'left' | 'right'): void {
    console.log(`Image on ${side} side loaded successfully`);
    if (side === 'left') {
      this.loadingLeft = false;
    } else {
      this.loadingRight = false;
    }
  }

  onImageError(side: 'left' | 'right'): void {
    //console.error(`Failed to load image on ${side} side.`);
    if (side === 'left') {
      this.loadingLeft = false;
    } else {
      this.loadingRight = false;
    }
  }


}
