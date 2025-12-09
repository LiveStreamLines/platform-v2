import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CameraZoomComponent } from './camera-zoom.component';

describe('CameraZoomComponent', () => {
  let component: CameraZoomComponent;
  let fixture: ComponentFixture<CameraZoomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CameraZoomComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CameraZoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
