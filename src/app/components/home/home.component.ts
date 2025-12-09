  import { Component, OnInit } from '@angular/core';
  import { Router } from '@angular/router';
  import { CommonModule } from '@angular/common';  // Import CommonModule for ngFor and ngIf
  import { FormsModule } from '@angular/forms';  // Import FormsModule
  import { MatCardModule } from '@angular/material/card';
  import { MatButtonModule } from '@angular/material/button';
  import { DeveloperService } from '../../services/developer.service';
  import { Developer } from '../../models//developer.model';
  import { AuthService } from '../../services/auth.service';
  import { UserService } from '../../services/users.service';
  import { BreadcrumbService } from '../../services/breadcrumb.service';
  import { environment } from '../../../environment/environments';
  import { MatDialog } from '@angular/material/dialog';
  import { ManualVideoDialogComponent } from '../manual-video-dialog/manual-video-dialog.component';
  import { HeaderService } from '../../services/header.service';
import { User } from '../../models/user.model';

  @Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule],  // Add the HeaderComponent to imports
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
  })

  export class HomeComponent implements OnInit {
    developers: Developer[] = [];
    loading: boolean = true;
    filteredDevelopers: Developer[] = [];  // To store filtered developers
    searchTerm: string = '';  // This will be used for filtering developers
    userRole: string | null = null;
    accessibleDevelopers: string[] = [];
    logopath: string =  environment.images;
    lastlogin: string | null = null;

    constructor(
      private developerService: DeveloperService, 
      private breadcrumbService: BreadcrumbService,
      private headerService: HeaderService,
      private authService: AuthService,
      private userService: UserService,
      private router: Router,
      private dialog: MatDialog
    ) {}

    ngOnInit(): void {

      this.checkloginStat();

      // Apply token expiration for specific user
      const currentUserEmail = this.authService.getUserEmail();
      if (currentUserEmail === 'ahmed@livestreamlines.com') {
        this.authService.setTokenExpirationForUser(currentUserEmail, 1); // 60 minutes
        console.log(`Token expiration set for ${currentUserEmail}`);
      }

      this.headerService.showHeaderAndSidenav = true;


       // Check local storage for user preference
      const dontShowAgain = this.authService.getManual();
      if (!dontShowAgain) {
        // Open the dialog if preference is not set
        this.dialog.open(ManualVideoDialogComponent, {
          data: { title: 'Manual', videoUrl: 'assets/videos/manual.mp4' },
          panelClass: 'fullscreen-dialog', // Add a custom class for fullscreen styling
        });
      }

      this.userRole = this.authService.getUserRole();
      this.accessibleDevelopers = this.authService.getAccessibleDevelopers();

      this.developerService.getAllDevelopers2(this.accessibleDevelopers).subscribe({
        next: (data: Developer[]) => {
          this.developers = data.map(dev => ({
            ...dev,
            logo: this.logopath + "/" + dev.logo
          }));
          this.filteredDevelopers = this.developers;
          this.loading = false;
        },
        error: (err: any) => {
          console.error('Error fetching developers:', err);
          this.loading = false;
        },
        complete: () => {
          console.log('Developer data loading complete.');
        }
      });

      // this.developerService.getAllDevelopers().subscribe({
      //   next: (data: Developer[]) => {
      //     // If the logo is a relative path, prepend the base URL
      //     this.developers = data.map(dev => ({
      //       ...dev,
      //       logo: this.logopath + "/" + dev.logo  // Prepend the base URL if needed
      //     }));
      //     // Filter developers based on role and accessible developers
      //     this.filteredDevelopers = this.userRole === 'Super Admin' || this.accessibleDevelopers[0] === 'all'
      //     ? this.developers // Admins see all developers
      //     : this.developers.filter((dev) =>
      //         this.accessibleDevelopers.includes(dev._id)
      //       );
      //     this.loading = false;  // Stop loading when data is fetched
      //   },
      //   error: (err: any) => {
      //     console.error('Error fetching developers:', err);
      //     this.loading = false;  // Stop loading in case of error
      //   },
      //   complete: () => {
      //     console.log('Developer data loading complete.');
      //   }
      // });
      
      this.breadcrumbService.setBreadcrumbs([
        { label: 'Home' },
      ]);

    }

    // This function will filter developers based on the search term
    filterDevelopers(): void {
      if (this.searchTerm) {
        this.filteredDevelopers = this.developers.filter(developer =>
          developer.developerName.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
      } else {
        // Reset to the full filtered list based on role and accessible developers
        this.filteredDevelopers =
          this.userRole === 'Super Admin'
            ? this.developers
            : this.developers.filter((dev) =>
                this.accessibleDevelopers.includes(dev._id)
            );
      }
    }

    onDeveloperClick(developer: Developer): void {
      this.router.navigate(['/home', developer.developerTag]);  // Navigate to ProjectListComponent with developer ID
    }


    checkloginStat() {
      const userId = this.authService.getUserId();
      if (userId) {
        const user = this.userService.getUserById(userId).subscribe(
          {
            next: data => {
              console.log("Get User Data");
              if (!data.LastLoginTime) {
                
                console.log("No loginTime");
                const now = new Date().toISOString();

                this.userService.updateUser(userId, {LastLoginTime: now}).subscribe(
                  {
                    next: data => console.log("update login time"),
                    error: err => console.log(err)
                  }
                );

              }
            },
            error: err => console.log(err)
          }
        );
      }

      const now = new Date().toISOString();
      
    }

  }
