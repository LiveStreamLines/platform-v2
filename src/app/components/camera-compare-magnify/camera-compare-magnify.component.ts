import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CameraDetailService } from '../../services/camera-detail.service';
import { FormsModule } from '@angular/forms';  // Import FormsModule for ngModel
import { CommonModule } from '@angular/common'; // Import CommonModule for ngFor and ngIf
import { MatInputModule } from '@angular/material/input';


@Component({
  selector: 'app-camera-compare-magnify',
  standalone: true,
  imports: [CommonModule, FormsModule, MatInputModule],
  templateUrl: './camera-compare-magnify.component.html',
  styleUrl: './camera-compare-magnify.component.css'
})
export class CameraCompareMagnifyComponent implements OnInit {

  @Input() inselectedDate1Picture: string = '';
  @Input() inselectedDate2Picture: string = '';
 

  circleSize: number = 200;
  mouseX: number = 0;
  mouseY: number = 0;

  offsetX = 0;
  offsetY = 0;
  containerWidth!: number;
  containerHeight!: number;
  mainImageWidth!: number;
  mainImageHeight!: number;

  loadingLeft = false;
  loadingRight = false;


  @ViewChild('compareContainer', { static: true }) compareContainer!: ElementRef;
  @ViewChild('mainImage') mainImageRef!: ElementRef<HTMLImageElement>;
  // @ViewChild('magnifiedImage') magnifiedImageRef!: ElementRef<HTMLImageElement>;

  

  constructor(
   private route: ActivatedRoute,
   private cameraDetailService: CameraDetailService
  ) {}

  ngOnInit(): void {
  }

 
  onMouseMove(event: MouseEvent) {
    const rect = this.compareContainer.nativeElement.getBoundingClientRect();

    // Mouse coordinates relative to the container
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Set circle position
    this.mouseX = x - this.circleSize / 2;
    this.mouseY = y - this.circleSize / 2;

    // Set offset for second image to align with the area under the circle
    this.offsetX = x;
    this.offsetY = y;
  
  }
 
 
  onImageLoad(side: 'left' | 'right'): void {
    //const imgElement = side === 'left' ? this.mainImageRef.nativeElement : this.magnifiedImageRef.nativeElement;
    console.log(`Image on ${side} side loaded successfully`);
    if (side === 'left') {
      this.loadingLeft = false;
      const imgElement = this.mainImageRef.nativeElement;
      console.log(imgElement);
      this.mainImageWidth = imgElement.width;
      this.mainImageHeight = imgElement.height;
      console.log(this.mainImageHeight, this.mainImageWidth);
    } else {
      this.loadingRight = false;
    }
  }

  onImageError(side: 'left' | 'right'): void {
 //   console.error(`Failed to load image on ${side} side.`);
    if (side === 'left') {
      this.loadingLeft = false;
    } else {
      this.loadingRight = false;
    }
  }

   
}
