import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HeaderService {
  private _showHeaderAndSidenav = true;

  get showHeaderAndSidenav(): boolean {
    return this._showHeaderAndSidenav;
  }

  set showHeaderAndSidenav(value: boolean) {
    this._showHeaderAndSidenav = value;
  }
}
