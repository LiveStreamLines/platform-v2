import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CameraMonitorComponent } from './camera-monitor.component';

describe('CameraMonitorComponent', () => {
  let component: CameraMonitorComponent;
  let fixture: ComponentFixture<CameraMonitorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CameraMonitorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CameraMonitorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
