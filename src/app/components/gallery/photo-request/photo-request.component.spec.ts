import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotoRequestComponent } from './photo-request.component';

describe('PhotoRequestComponent', () => {
  let component: PhotoRequestComponent;
  let fixture: ComponentFixture<PhotoRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotoRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhotoRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
