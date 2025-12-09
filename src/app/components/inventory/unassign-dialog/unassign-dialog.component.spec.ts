import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnassignDialogComponent } from './unassign-dialog.component';

describe('UnassignDialogComponent', () => {
  let component: UnassignDialogComponent;
  let fixture: ComponentFixture<UnassignDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnassignDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnassignDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
