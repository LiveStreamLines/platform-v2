import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutUsComponent {
  uaeContacts = [
    { role: 'Sales', name: 'Sakina Elyassini', phone: '+971 54 583 1767', email: 'sakina@livestreamlines.com' },
    { role: 'Accounting', name: 'Shimaa Elhaj', phone: '+971 50 585 9336', email: 'shimaa@livestreamlines.com' },
    { role: 'Operation', name: 'Anna Umali', phone: '+971 50 558 4301', email: 'anna@livestreamlines.com' },
    { role: 'Technical', name: 'Michael Triol', phone: '+971 50 718 6796', email: 'michael@livestreamlines.com' },
    { role: 'IT', name: 'Ammar Omer', phone: '+971 56 184 8902', email: 'amar@livestreamlines.com' }
  ];

  saudiContacts = [
    { role: 'General', name: 'Mohamed Kamal', phone: '+966 37363636', email: 'm.kamal@ksalapse.com' },
    { role: 'Technical', name: 'Wasim Sagid', phone: '+966 507186796', email: 'wasim@ksalapse.com' },
    { role: 'IT', name: 'Ammar Omer', phone: '+966 561848902', email: 'info@ksalapse.com' }
  ];
}