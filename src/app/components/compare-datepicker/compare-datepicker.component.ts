import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-compare-datepicker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './compare-datepicker.component.html',
  styleUrl: './compare-datepicker.component.css'
})
export class CompareDatepickerComponent {
  @Input() dateInputValue!: string; // Bound to the date picker value
  @Input() pictures: string[] = []; // List of pictures to display in the thumbnail strip
  @Input() selectedThumbnail!: string; // Currently selected picture
  @Input() path!: string;

  @Output() dateChange = new EventEmitter<string>(); // Emits the new date value
  @Output() pictureSelect = new EventEmitter<string>(); // Emits the selected picture

  onDateChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.dateChange.emit(target.value);
  }

  onThumbnailSelect(picture: string): void {
    this.pictureSelect.emit(picture);
  }

  getThumbPictureUrl(picture: string): string {
    // Logic to generate thumbnail URL (implement as needed)
    return `${this.path}/thumbs/${picture}.jpg` ;
  }

  formatTimestamp(picture: string): string {
    // Logic to format timestamp (implement as needed)
    const year = picture.substring(0, 4);
    const month = picture.substring(4, 6);
    const day = picture.substring(6, 8);
    const hour = picture.substring(8, 10);
    const minute = picture.substring(10, 12);
    const second = picture.substring(12, 14);
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;  }

    thumbformat(picture: string): string {
      // Logic to format timestamp (implement as needed)
      const hour = picture.substring(8, 10);
      const minute = picture.substring(10, 12);
      const second = picture.substring(12, 14);
      return `${hour}:${minute}:${second}`;  }
}

