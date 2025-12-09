import { Component, OnInit } from '@angular/core';
import { HeaderService } from '../../services/header.service';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.css'
})
export class NotFoundComponent implements OnInit {
  constructor (private headerService: HeaderService){}

  ngOnInit(): void {
    this.headerService.showHeaderAndSidenav = false;     
  }

}
