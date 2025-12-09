import { Injectable, Input } from '@angular/core';
import { CameraDetailService } from './camera-detail.service';

@Injectable({
  providedIn: 'root'
})
export class CameraCompareService {

    projectTag!: string;
    developerTag!: string;
    path: string = '';
    date1Pictures: string[] = [];
    date2Pictures: string[] = [];
    selectedDate1Picture: string = '';
    selectedDate2Picture: string = '';
    selectedDate1:Date = new Date(); // This will be bound to ngModel
    selectedDate2: Date = new Date(); // This will be bound to ngModel
    selectedDate1Thumbnail!: string;
    selectedDate2Thumbnail!: string;

    constructor(private cameraDetailService: CameraDetailService) {}

 
    loadComparisonPhotos(cameraName:string, date1: string = '', date2: string = ''): void {
        // this.cameraDetailService.getCameraDetails(this.projectId, this.cameraName, date1, date2)
        this.cameraDetailService.getCameraDetails(this.developerTag, this.projectTag,cameraName,date1,date2)
        .subscribe(data => {
            this.date1Pictures = data.date1Photos.map(photo => photo.toString());
            this.date2Pictures = data.date2Photos.map(photo => photo.toString());
            this.path = data.path;
            // console.log("Date 1 Pictures:", this.date1Pictures);  // Debug log
            // console.log("Date 2 Pictures:", this.date2Pictures);  // Debug log
            // Set default selected pictures
            if (this.date1Pictures.length > 0) {
                const lastPhotoDate1 = this.date1Pictures[this.date1Pictures.length - 1];
                this.selectedDate1Picture = this.getLargePictureUrl(lastPhotoDate1);
                this.selectedDate1Thumbnail = lastPhotoDate1;
                this.selectedDate1 = this.parseDateFromTimestamp(lastPhotoDate1);
            }
            if (this.date2Pictures.length > 0) {
                const lastPhotoDate2 = this.date2Pictures[this.date2Pictures.length - 1];
                this.selectedDate2Picture = this.getLargePictureUrl(lastPhotoDate2);
                this.selectedDate2Thumbnail = lastPhotoDate2;
                this.selectedDate2 = this.parseDateFromTimestamp(lastPhotoDate2);
            }
        });
    }

     // Parse date from a timestamp format like "yyyyMMddHHmmss"
    parseDateFromTimestamp(timestamp: string): Date {
        const year = parseInt(timestamp.substring(0, 4), 10);
        const month = parseInt(timestamp.substring(4, 6), 10) - 1; // Month is zero-indexed
        const day = parseInt(timestamp.substring(6, 8), 10);
        return new Date(year, month, day);
    }

    // Method to get large picture URL
    getLargePictureUrl(picture: string): string {
        //return `https://lslcloud.com/photos/${this.developerTag}/${this.projectTag}/${this.cameraName}/large/${picture}.jpg`;
        return `${this.path}/large/${picture}.jpg` ;
    }

    // Method to get thumbnail URL
    getThumbPictureUrl(picture: string): string {
        //return `https://lslcloud.com/photos/${this.developerTag}/${this.projectTag}/${this.cameraName}/thumbs/${picture}.jpg`;
        return `${this.path}/thumbs/${picture}.jpg` ;
    }


}