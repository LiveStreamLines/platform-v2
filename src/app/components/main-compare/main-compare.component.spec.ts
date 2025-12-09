import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainCompareComponent } from './main-compare.component';

describe('MainCompareComponent', () => {
  let component: MainCompareComponent;
  let fixture: ComponentFixture<MainCompareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainCompareComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainCompareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
