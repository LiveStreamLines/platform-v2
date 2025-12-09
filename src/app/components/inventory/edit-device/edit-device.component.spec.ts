import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditDeviceComponent } from './edit-device.component';

describe('EditDeviceDialogComponent', () => {
  let component: EditDeviceComponent;
  let fixture: ComponentFixture<EditDeviceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditDeviceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditDeviceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
