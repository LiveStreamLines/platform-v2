import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatToolbar } from '@angular/material/toolbar';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField } from '@angular/material/input';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerInputEvent, MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core'; // For date functionality
import { DeveloperService } from '../../services/developer.service';
import { ProjectService } from '../../services/project.service';
import { CameraDetailService } from '../../services/camera-detail.service';
import { WeatherService } from '../../services/weather.service';
import { CameraDetail } from '../../models/camera-detail.model';
import { MainCompareComponent } from '../main-compare/main-compare.component';
import { GenerateVideoComponent } from '../generate-video/generate-video.component';
import { GeneratePhotoComponent } from '../generate-photo/generate-photo.component';
import { CameraZoomComponent } from '../camera-zoom/camera-zoom.component';
import { ShareComponent } from './share/share.component';
import { StudioComponent } from "../studio/studio.component";
import { Project } from '../../models/project.model';
import { Developer } from '../../models/developer.model';
import { BreadcrumbService } from '../../services/breadcrumb.service';
import { environment } from '../../../environment/environments';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';



@Component({
  selector: 'app-camera-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbar,
    MatButton,
    MatIcon,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    FormsModule,
    CameraZoomComponent,
    MainCompareComponent,
    GenerateVideoComponent,
    GeneratePhotoComponent,
    ShareComponent,
    StudioComponent
],
  templateUrl: './camera-detail.component.html',  
  styleUrls: ['./camera-detail.component.css']
})
export class CameraDetailComponent implements OnInit {
  projectId!: any;
  developerId!: any;  
  projectTag!: string;
  developerTag!: string;
  projectName!: string;
  developerName!: string;
  cameraName!: string;
  cameraDetails!: CameraDetail;
  firstPhoto!: string;
  lastPhoto!: string;
  noonPhotoUrl!: string;
  lastPictureUrl!: string;
  selectedPictureUrl!: string;
  photosByDate: any = {};
  date1Pictures: string[] = [];
  date2Pictures: string[] = [];
  path: string = ''; 
  loadingLargePicture: boolean = false;  // Add loading state for large picture
  selectedThumbnail: string = '';  // Add state for selected thumbnail
  selectedDate: string = ''; // This will be bound to ngModel
  mode: string = 'single';  // Default view mode
  compareView: 'sideBySide' | 'slider' | 'magnify' = 'sideBySide';
  zoomView: 'lens' | 'pan' = 'lens';
  showDateTime: boolean = true;
  showWeather: boolean = true;
  weatherString: string = '';


  isShareModalOpen: boolean = false;
  currentPhotoUrl: string = '';
  photoUrl: string ='';

  isSmallScreen: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private developerService: DeveloperService,
    private projectService: ProjectService,
    private cameraDetailService: CameraDetailService,
    private weatherService: WeatherService,
    private breadcrumbService: BreadcrumbService,
    private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit(): void {

    this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.Tablet])
    .subscribe(result => {
      this.isSmallScreen = result.matches; // True for small screens
    });

    this.cameraName = this.route.snapshot.params['cameraName'];
    this.developerTag = this.route.snapshot.paramMap.get('developerTag')!;
    this.projectTag = this.route.snapshot.paramMap.get('projectTag')!;
    
      // Get Developer ID by developerTag
      this.developerService.getDeveloperIdByTag(this.developerTag).subscribe({
        next: (developer: Developer[]) => {
          this.developerId = developer[0]._id;
          this.developerName = developer[0].developerName;
           // Once we have the developerId, get the project ID
           this.projectService.getProjectIdByTag(this.projectTag).subscribe({
            next: (project: Project[]) => {
              this.projectId = project[0]._id;
              this.projectName = project[0].projectName;
              this.getCameraDetails(); // Now that we have the projectId, fetch the cameras
              this.breadcrumbService.setBreadcrumbs([
                { label: 'Home ', url: '/home' },
                { label: `${this.developerName}`, url: `home/${this.developerTag}` },
                { label: `${this.projectName}`, url: `home/${this.developerTag}/${this.projectTag}` },
                { label: `Timelapse`, url: `home/${this.developerTag}/${this.projectTag}/timelapse` },
                { label: `${this.cameraName}`}
              ]);
            },
            error: (err: any) => {
              console.log(err);
            }
           });         
        },
        error: (err: any) => {
          console.log(err);
        }
      });
  }

  getCameraDetails(date1: string = '', date2: string = ''): void {
    console.log(date1, date2);
    //this.cameraDetailService.getCameraDetails(this.projectId, this.cameraName, date1, date2)
    this.cameraDetailService.getCameraDetails(this.developerTag, this.projectTag,this.cameraName,date1,date2)
    .subscribe({
      next: (data: CameraDetail) => {
        this.date2Pictures = data.date2Photos.map(photo => photo.toString());
        this.path =`${environment.images}/media/upload/${this.developerTag}/${this.projectTag}/${this.cameraName}/`
        ;
      
        const lastPhoto = this.date2Pictures[this.date2Pictures.length - 1];

        const lastDate = lastPhoto.substring(0, 4) + '-' + lastPhoto.substring(4, 6) + '-' + lastPhoto.substring(6, 8);
        // Set the selectedDate to the last date
        this.selectedDate = lastDate;

        this.lastPictureUrl = this.getLargePictureUrl(lastPhoto);
        this.selectedPictureUrl = this.lastPictureUrl;
        this.selectedThumbnail = lastPhoto;  // Set the last photo as selected by default
        const formattedTime = this.convertToWeather(lastPhoto);  // Convert timestamp to weather API format
        this.getWeather(formattedTime);
      },
      error: (err: any) => {
        console.error('Error fetching camera details:', err);
      },
      complete: () => {
        console.log('Camera details loaded successfully.');
      }
    });
  }

  formatTimestamp(timestamp: string): string {
    const year = timestamp.substring(0, 4);
    const month = timestamp.substring(4, 6);
    const day = timestamp.substring(6, 8);
    const hour = timestamp.substring(8, 10);
    const minute = timestamp.substring(10, 12);
    const second = timestamp.substring(12, 14);
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  }

  thumbformat(timestamp: string): string {
    const hour = timestamp.substring(8, 10);
    const minute = timestamp.substring(10, 12);
    const second = timestamp.substring(12, 14);
    return `${hour}:${minute}:${second}`;
  
  }

 
  // Get the full URL for the large picture
  getLargePictureUrl(picture: string): string {
    return `${this.path}/large/${picture}.jpg` ;
  }

  // Get the full URL for the thumbnail picture
  getThumbPictureUrl(picture: string): string {
    return `${this.path}/thumbs/${picture}.jpg` ;;
  }

  // Handle click on thumbnail to show the large picture
  onThumbnailClick(picture: string): void {
    this.loadingLargePicture = true;  // Start loading state
    this.selectedPictureUrl = '';  // This will temporarily "hide" the image

    setTimeout(() => {
      this.selectedPictureUrl = this.getLargePictureUrl(picture);  // Set the large picture URL
      this.selectedThumbnail = picture;  // Mark the selected thumbnail
      const formattedTime = this.convertToWeather(picture);  // Convert to the weather API format
      this.getWeather(formattedTime);  // Fetch the weather for the selected picture
    }, 100);  // Adding a small delay can help with a smooth transition


  }

  // Called when the large picture is fully loaded
  onLargePictureLoad(): void {
    console.log('Large picture loaded.');  // Debug log
    this.loadingLargePicture = false;  // Stop loading state
    const imgElement = document.querySelector('.large-picture') as HTMLElement;
    imgElement.classList.add('loaded');
  }

  // Handle image loading error
  onLargePictureError(): void {
    console.error('Failed to load large picture:', this.selectedPictureUrl);
    this.loadingLargePicture = false;
  }

  setMode(mode: string): void {
    this.mode = mode;  // Set the current mode
    console.log(`Mode set to: ${mode}`);
  }

  setCompareView(view: 'sideBySide' | 'slider' | 'magnify') {
    this.compareView = view;
  }

  setZoomView(view: 'lens' | 'pan' ) {
    this.zoomView = view;
    console.log(`Show zoom mode: ${this.zoomView}`);
  }
  
  generateVideo(): void {
    console.log('Generating video...');
    // Implement the functionality to generate video
  }
  
  generatePhoto(): void {
    console.log('Generating photo...');
    // Implement the functionality to generate photo
  }
  
  onDateChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;

    // const selectedDate : Date = event.value !;
    const selectedDate = new Date(inputElement.value);
    const formattedDate = this.formatDate(selectedDate);  // Format the date to yyyymmdd
  
    // Fetch camera details with the selected date
    this.getCameraDetails('', formattedDate);
  }

  formatDate(date: Date): string {
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');  // Ensure two digits
    const day = date.getDate().toString().padStart(2, '0');  // Ensure two digits
    return `${year}${month}${day}`;
  }

  convertToWeather(timestamp: string): string {
      // Manually extract the parts of the timestamp (yyyymmddhhmmss)
      const year = parseInt(timestamp.substring(0, 4), 10); // "2025" -> 2025
      const month = parseInt(timestamp.substring(4, 6), 10); // "01" -> 1
      const day = parseInt(timestamp.substring(6, 8), 10); // "12" -> 12
      const hour = parseInt(timestamp.substring(8, 10), 10); // "12" -> 12

      const date = new Date(year, month - 1, day, hour); // JS months are 0-indexed

    // Adjust the hours
      date.setHours(date.getHours() - 4);
      // Extract updated components from the Date object
      const updatedYear = date.getFullYear();
      const updatedMonth = (date.getMonth() + 1).toString().padStart(2, "0"); // JS months are 0-indexed
      const updatedDay = date.getDate().toString().padStart(2, "0");
      const updatedHour = date.getHours().toString().padStart(2, "0");

      // Format it as "YYYY-MM-DDTHH:mm:ss.000Z"
      const formattedTime = `${updatedYear}-${updatedMonth}-${updatedDay}T${updatedHour}:00:00.000Z`;

      return formattedTime;
  }

  getWeather(time: string): void {
    this.weatherService.getWeatherByTime(time).subscribe({
      next: (data) => {
        // Convert Fahrenheit to Celsius: (temp - 32) * (5/9)
        const tempCelsius = ((data.temp - 32) * 5) / 9;
        const hum = data.rh;

        // Format the weather string
        this.weatherString = `Temp: ${tempCelsius.toFixed(1)}°C\nHumidity: ${hum}%`;
      },
      error: (error) => {
        console.error('Error fetching weather data', error);
        this.weatherString = 'No Weather data';
      }
    });
  }

  goBack(): void {
    this.router.navigate([`home/${this.developerTag}/${this.projectTag}/timelapse`]);
  }

  openShareModal(photoUrl: string) {
    this.currentPhotoUrl = photoUrl;
    this.isShareModalOpen = true;
  }

  closeShareModal() {
    this.isShareModalOpen = false;
  }

}
