import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CameraCompareComponent } from './camera-compare.component';

describe('CameraCompareComponent', () => {
  let component: CameraCompareComponent;
  let fixture: ComponentFixture<CameraCompareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CameraCompareComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CameraCompareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
