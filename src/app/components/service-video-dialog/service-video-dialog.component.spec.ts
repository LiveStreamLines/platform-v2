import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceVideoDialogComponent } from './service-video-dialog.component';

describe('ServiceVideoDialogComponent', () => {
  let component: ServiceVideoDialogComponent;
  let fixture: ComponentFixture<ServiceVideoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceVideoDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiceVideoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
