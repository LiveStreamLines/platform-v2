import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EcrdComponent } from './ecrd.component';

describe('EcrdComponent', () => {
  let component: EcrdComponent;
  let fixture: ComponentFixture<EcrdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EcrdComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EcrdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
