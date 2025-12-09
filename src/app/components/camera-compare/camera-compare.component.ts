import { Component, OnInit, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';  // Import FormsModule for ngModel
import { CommonModule } from '@angular/common'; // Import CommonModule for ngFor and ngIf

@Component({
  selector: 'app-camera-compare',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './camera-compare.component.html',
  styleUrl: './camera-compare.component.css'
})
export class CameraCompareComponent implements OnInit {
  @Input() inselectedDate1Picture: string = '';
  @Input() inselectedDate2Picture: string = '';

  sliderPosition: number = 50; // Starting split between images for visual comparison
  
  loadingLeft = false;
  loadingRight = false;
  
  constructor() {}

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
  //  console.error(`Failed to load image on ${side} side.`);
    if (side === 'left') {
      this.loadingLeft = false;
    } else {
      this.loadingRight = false;
    }
  }

  onThumbKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowRight' && this.sliderPosition < 100) {
      this.sliderPosition += 1; // Increment the slider position
      this.updateSlider();
    } else if (event.key === 'ArrowLeft' && this.sliderPosition > 0) {
      this.sliderPosition -= 1; // Decrement the slider position
      this.updateSlider();
    }
  }

  onThumbDragStart(event: MouseEvent): void {
    const trackElement = (event.target as HTMLElement).closest('.custom-slider')?.querySelector('.slider-track');

    if (!trackElement) {
      console.error('Slider track not found.');
      return;
    }

    const track = trackElement.getBoundingClientRect();

    const mouseMoveListener = (moveEvent: MouseEvent) => {
      const dragPosition = ((moveEvent.clientX - track.left) / track.width) * 100;
      this.sliderPosition = Math.min(Math.max(dragPosition, 0), 100); // Keep it between 0 and 100
      this.updateSlider();
    };

    const mouseUpListener = () => {
      window.removeEventListener('mousemove', mouseMoveListener);
      window.removeEventListener('mouseup', mouseUpListener);
    };

    window.addEventListener('mousemove', mouseMoveListener);
    window.addEventListener('mouseup', mouseUpListener);
  }

  // Method to update slider overlay based on sliderPosition
  updateSlider(): void {
    const leftImg = document.querySelector('.left-img') as HTMLElement;
    const rightImg = document.querySelector('.right-img') as HTMLElement;
    leftImg.style.clipPath = `inset(0 ${100 - this.sliderPosition}% 0 0)`;
    rightImg.style.clipPath = `inset(0 0 0 ${this.sliderPosition}%)`;
  }

}
