import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CameraViewerComponent } from './camera-viewer.component';

describe('CameraViewerComponent', () => {
  let component: CameraViewerComponent;
  let fixture: ComponentFixture<CameraViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CameraViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CameraViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
