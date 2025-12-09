import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CameraCompareSideComponent } from './camera-compare-side.component';

describe('CameraCompareSideComponent', () => {
  let component: CameraCompareSideComponent;
  let fixture: ComponentFixture<CameraCompareSideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CameraCompareSideComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CameraCompareSideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
