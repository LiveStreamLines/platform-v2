import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoRequestComponent } from './video-request.component';

describe('VideoRequestComponent', () => {
  let component: VideoRequestComponent;
  let fixture: ComponentFixture<VideoRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VideoRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
