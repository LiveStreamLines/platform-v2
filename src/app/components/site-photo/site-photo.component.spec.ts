import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SitePhotoComponent } from './site-photo.component';

describe('SitePhotoComponent', () => {
  let component: SitePhotoComponent;
  let fixture: ComponentFixture<SitePhotoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SitePhotoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SitePhotoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
