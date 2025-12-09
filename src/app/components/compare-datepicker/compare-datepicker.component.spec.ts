import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompareDatepickerComponent } from './compare-datepicker.component';

describe('CompareDatepickerComponent', () => {
  let component: CompareDatepickerComponent;
  let fixture: ComponentFixture<CompareDatepickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompareDatepickerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompareDatepickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
