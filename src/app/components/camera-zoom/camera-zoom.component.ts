import { Component, Input} from '@angular/core';
import { ViewChild, AfterViewInit } from '@angular/core';
import { ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-camera-zoom',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './camera-zoom.component.html',
  styleUrl: './camera-zoom.component.css'
})
export class CameraZoomComponent {

  @Input() selectedPictureUrl!: string;
  @Input() zoomView: 'lens' | 'pan' = 'lens';
  @ViewChild('mainImage') mainImage!: ElementRef<HTMLImageElement>;
  @ViewChild('panImage') panImage!: ElementRef<HTMLImageElement>;

  lensSize: number = 300; // Default lens size in pixels
  lensX: number = 0;  // Position of the zoom lens
  lensY: number = 0;
  backgroundPosition: string = '0px 0px';  // Background position for zoomed view
  BackgroundSize: string = '200% 200%';
  scale: number = 2;

  translateX = 0;
  translateY = 0;
  isPanning = false;
  startX = 0;
  startY = 0;
  transform = '';

  ngAfterViewInit(): void {
    // Set initial zoom background size based on mainImage dimensions
    setTimeout(() => this.updateZoomBackgroundSize(), 0);
    this.updateTransform(); // Set initial transform
  }

  updateZoomBackgroundSize(): void {
    if (!this.mainImage || !this.mainImage.nativeElement) return;

    const imageElement = this.mainImage.nativeElement;
    const renderedWidth = imageElement.width;
    const renderedHeight = imageElement.height;

    // const widthRatio =  (naturalWidth / renderedWidth) * 100 * this.scale;
    // const heightRatio = (naturalHeight / renderedHeight) * 100 * this.scale;

    const widthRatio =  renderedWidth * this.scale;
    const heightRatio = renderedHeight * this.scale;

    this.BackgroundSize = `${widthRatio}px ${heightRatio}px`;
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.mainImage) return;

      const img = this.mainImage.nativeElement;
      const rect = img.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
  
      // Set lens position
      this.lensX = x - (this.lensSize/2);  // Center lens
      this.lensY = y - (this.lensSize/2);
  
      // Set background position based on image natural dimensions
      const xPercent = (x / rect.width) * 100;
      const yPercent = (y / rect.height) * 100;
      this.backgroundPosition = `${xPercent}% ${yPercent}%`;  
  }

  hideZoom(): void {
    this.lensX = 0;
    this.lensY = 0;
    this.backgroundPosition = '0% 0%';
  }

  updateZoomScale(): void {
    if (this.scale === 1) {
      this.translateX = 0;
      this.translateY = 0;
    }
    this.updateZoomBackgroundSize();
    this.updateTransform(); // Recalculate pan transform
  }


  startPan(event: MouseEvent): void {
    this.isPanning = true;
    this.startX = event.clientX - this.translateX;
    this.startY = event.clientY - this.translateY;
    event.preventDefault();

  }

  pan(event: MouseEvent): void {
    if (!this.isPanning) return;

    // Calculate the new translation positions
  const newTranslateX = event.clientX - this.startX;
  const newTranslateY = event.clientY - this.startY;

  const panImageElement = this.panImage.nativeElement;

  // Get the dimensions of the container and the scaled image
  const containerWidth = panImageElement.parentElement?.offsetWidth || 0;
  const containerHeight = panImageElement.parentElement?.offsetHeight || 0;
  const scaledWidth = panImageElement.width * this.scale;
  const scaledHeight = panImageElement.height * this.scale;

  // Calculate the maximum allowed translations to prevent moving beyond edges
  const maxTranslateX = Math.max(0, (scaledWidth - containerWidth) / 2);
  const maxTranslateY = Math.max(0, (scaledHeight - containerHeight) / 2);

  // Apply constraints to keep the image within bounds
  this.translateX = Math.min(maxTranslateX, Math.max(-maxTranslateX, newTranslateX));
  this.translateY = Math.min(maxTranslateY, Math.max(-maxTranslateY, newTranslateY));


    this.updateTransform();
    event.preventDefault();

  }

  endPan(): void {
    this.isPanning = false;
  }

  updateTransform(): void {
    this.transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`;
  }

  
   
}



