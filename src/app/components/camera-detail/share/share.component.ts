import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-share',
  standalone: true,
  imports: [],
  templateUrl: './share.component.html',
  styleUrl: './share.component.css'
})
export class ShareComponent {

  @Input() photoUrl: string = '';
  @Output() close = new EventEmitter<void>();


  copyLink() {
    navigator.clipboard
      .writeText(this.photoUrl)
      .then(() => alert('Link copied to clipboard!'))
      .catch((err) => console.error('Failed to copy link: ', err));
  }

  getEncodedWhatsAppUrl(): string {
    const message = `Get the link of the picture:\n${this.photoUrl}`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
  }

  closeModal() {
    this.close.emit();
  }

}
