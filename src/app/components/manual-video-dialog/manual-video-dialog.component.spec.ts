import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualVideoDialogComponent } from './manual-video-dialog.component';

describe('ManualVideoDialogComponent', () => {
  let component: ManualVideoDialogComponent;
  let fixture: ComponentFixture<ManualVideoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManualVideoDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManualVideoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
