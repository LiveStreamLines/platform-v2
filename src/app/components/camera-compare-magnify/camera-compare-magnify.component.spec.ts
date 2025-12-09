import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CameraCompareMagnifyComponent } from './camera-compare-magnify.component';

describe('CameraCompareMagnifyComponent', () => {
  let component: CameraCompareMagnifyComponent;
  let fixture: ComponentFixture<CameraCompareMagnifyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CameraCompareMagnifyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CameraCompareMagnifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
