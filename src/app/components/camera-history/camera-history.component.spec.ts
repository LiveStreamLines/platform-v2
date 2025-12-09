import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CameraHistoryComponent } from './camera-history.component';

describe('CameraHistoryComponent', () => {
  let component: CameraHistoryComponent;
  let fixture: ComponentFixture<CameraHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CameraHistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CameraHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
