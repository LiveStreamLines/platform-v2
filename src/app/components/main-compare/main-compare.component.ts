  import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
  import { ActivatedRoute } from '@angular/router';
  import { CameraDetailService } from '../../services/camera-detail.service';
  import { CommonModule } from '@angular/common'; // Import CommonModule for ngFor and ngIf
  import { MatToolbarModule } from '@angular/material/toolbar';
  import { MatIconModule } from '@angular/material/icon';
  import { CompareDatepickerComponent } from '../compare-datepicker/compare-datepicker.component';
  import { CameraCompareComponent } from '../camera-compare/camera-compare.component';
  import { CameraCompareMagnifyComponent } from '../camera-compare-magnify/camera-compare-magnify.component';
  import { CameraCompareSideComponent } from '../camera-compare-side/camera-compare-side.component';
  import { environment } from '../../../environment/environments';

  @Component({
    selector: 'app-main-compare',
    standalone: true,
    imports: [
      CommonModule, 
      CompareDatepickerComponent, 
      CameraCompareSideComponent, 
      CameraCompareComponent,
      CameraCompareMagnifyComponent,
      MatToolbarModule, 
      MatIconModule, 
      CameraCompareMagnifyComponent],
    templateUrl: './main-compare.component.html',
    styleUrl: './main-compare.component.css'
  })
  export class MainCompareComponent implements OnInit{
    
    @Input() projectId!: string; // Receiving projectId from parent
    @Input() cameraName!: string; // Receiving cameraName from pare

    projectTag!: string;
    developerTag!: string;
    date1Pictures: string[] = [];
    date2Pictures: string[] = [];
    selectedDate1Picture: string = '';
    selectedDate2Picture: string = '';
    selectedDate1Thumbnail!: string;
    selectedDate2Thumbnail!: string;
    path: string = '';

    selectedDate1:string = ''; // This will be bound to ngModel
    selectedDate2:string = ''; // This will be bound to ngModel

    compareView: 'sideBySide' | 'slider' | 'magnify' = 'sideBySide';

    constructor(
      private route: ActivatedRoute,
      private cameraDetailService: CameraDetailService
    ) {}

    ngOnInit(): void {
      this.developerTag = this.route.snapshot.paramMap.get('developerTag')!;
      this.projectTag = this.route.snapshot.paramMap.get('projectTag')!;

      if (this.projectId && this.cameraName) {
        this.loadComparisonPhotos();
      }
    }

    // Fetch both date1 and date2 pictures
    loadComparisonPhotos(date1: string = '', date2: string = ''): void {
      this.cameraDetailService.getCameraDetails(this.developerTag, this.projectTag,this.cameraName,date1,date2)
      .subscribe(data => {
        this.date1Pictures = data.date1Photos.map(photo => photo.toString());
        this.date2Pictures = data.date2Photos.map(photo => photo.toString());
        this.path = `${environment.backend}/media/upload/${this.developerTag}/${this.projectTag}/${this.cameraName}/`
        ;
        
        // Preserve existing selection or set to the default value
          if (this.date1Pictures.length > 0) {
            if (!this.selectedDate1Thumbnail || !this.date1Pictures.includes(this.selectedDate1Thumbnail)) {
              const lastPhotoDate1 = this.date1Pictures[this.date1Pictures.length - 1];
              this.selectedDate1Picture = this.getLargePictureUrl(lastPhotoDate1);
              this.selectedDate1Thumbnail = lastPhotoDate1;
              this.selectedDate1 = this.parseDateFromTimestamp(lastPhotoDate1);
            } 
          }

          if (this.date2Pictures.length > 0) {
            if (!this.selectedDate2Thumbnail || !this.date2Pictures.includes(this.selectedDate2Thumbnail)) {
              const lastPhotoDate2 = this.date2Pictures[this.date2Pictures.length - 1];
              this.selectedDate2Picture = this.getLargePictureUrl(lastPhotoDate2);
              this.selectedDate2Thumbnail = lastPhotoDate2;
              this.selectedDate2 = this.parseDateFromTimestamp(lastPhotoDate2);
            } 
          }
      });
    }

      
    onDate1PictureSelect(picture: string): void {
      this.selectedDate1Picture = this.getLargePictureUrl(picture);
      this.selectedDate1Thumbnail = picture; // Highlight the selected thumbnail
    }

    onDate2PictureSelect(picture: string): void {
      this.selectedDate2Picture = this.getLargePictureUrl(picture);
      this.selectedDate2Thumbnail = picture; // Highlight the selected thumbnail
    }

    // Method to get large picture URL
    getLargePictureUrl(picture: string): string {
      return `${this.path}/large/${picture}.jpg` ;
    }

    onDate1Change(newDate: string): void {
      const firstDate = this.formatDate(newDate); // Format it for API call
      const secondDate = this.formatDate(this.selectedDate2); // Format the other date
      this.selectedDate1 = newDate; // Update bound Date object
      this.loadComparisonPhotos(firstDate, secondDate); // Load photos
    }
    
    onDate2Change(newDate: string): void {
      const secondDate = this.formatDate(newDate);
      const firstDate = this.formatDate(this.selectedDate1);
      this.selectedDate2 = newDate;
      this.loadComparisonPhotos(firstDate, secondDate); // Load photos
    }
    
    
    // Parse date from a timestamp format like "yyyyMMddHHmmss"
    parseDateFromTimestamp(timestamp: string): string {
      const year = timestamp.substring(0, 4);
      const month = timestamp.substring(4, 6); // Month is zero-indexed
      const day = timestamp.substring(6, 8);
      return `${year}-${month}-${day}`;
    }

    formatDate(dateString: string): string {
      return dateString.replace(/-/g, "");
    }

    setCompareView(view: 'sideBySide' | 'slider' | 'magnify') {
      this.compareView = view;
    }


  }
