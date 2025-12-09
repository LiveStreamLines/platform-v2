import { Component, OnInit, ElementRef, AfterViewInit, ViewChild, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';  // Import FormsModule
import { CommonModule } from '@angular/common';  // Import CommonModule for *ngIf
import { MatTabsModule } from '@angular/material/tabs';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/users.service';
import { HeaderService } from '../../services/header.service';
import { ActivatedRoute } from '@angular/router';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, MatTabsModule],  // Import FormsModule here
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, AfterViewInit {
  email: string = '';
  password: string = '';
  phone: string = '';
  otp: string = '';
  loginError: string | null = null;
  isOtpSent: boolean = false;
  isPhoneRequired: boolean = false;
  isPhoneSubmitted: boolean = false;
  userId: string | null = null;
  loading: boolean = false; // Flag to manage loading state
  isForgotPassword = false; // Show the forgot password form
  resetPasswordEmail: string = '';
  currentView: 'login' | 'phoneVerification' | 'forgotPassword' = 'login'; // Current view state
  isMobileView: boolean = false;
  isIOS: boolean = false;
  
  @ViewChild('backgroundVideo', { static: true }) videoElement!: ElementRef<HTMLVideoElement>;

  // Country code selection
  selectedCountryCode: string = '+971'; // Default to UAE
  countries = [
    { name: 'UAE', code: '+971', flag: 'assets/uae.png' },
    { name: 'Saudi Arabia', code: '+966', flag: 'assets/saudi.png' },   
  ];

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router, 
    private headerService: HeaderService,
    private route: ActivatedRoute) {
      this.isIOS = Capacitor.getPlatform() === 'ios';
    }

    ngOnInit(): void {
      this.headerService.showHeaderAndSidenav = false;
      this.checkScreenSize();
      
      // Check for view query parameter
      const viewParam = this.route.snapshot.queryParams['view'];
      if (viewParam === 'forgotPassword') {
        this.currentView = 'forgotPassword';
      }
    }
  
    private checkScreenSize() {
      this.isMobileView = this.isIOS || window.innerWidth <= 768;
    }
  
    ngAfterViewInit(): void {
      if (!this.isMobileView && this.videoElement && this.videoElement.nativeElement) {
        this.videoElement.nativeElement.muted = true;
        this.videoElement.nativeElement.play(); // Ensures the video starts playing muted
      } 
    } 

 

  // Switch to Forgot Password view
  toggleForgotPassword(): void {
    this.currentView = 'forgotPassword';
    this.resetPasswordEmail = '';
    this.loginError = null;
  }

   // Switch to Phone Verification view
   togglePhoneVerification(): void {
    this.currentView = 'phoneVerification';
    this.phone = '';
    this.otp = '';
    this.loginError = null;
  }

 // Switch back to Login view
  backToLogin(): void {
    this.currentView = 'login';
    this.email = '';
    this.password = '';
    this.loginError = null;
  }

  onLogin(): void {
    this.loading = true;
    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.phoneRequired) {
          // If phone verification is required
          this.isPhoneRequired = true;
          this.currentView = 'phoneVerification';
        } else {
          // Login successful
          this.router.navigate(['home']);
          this.headerService.showHeaderAndSidenav = true;
        }
      },
      error: (err) => {
        this.loading = false;
        this.loginError = err.error.msg;
        console.error('Login failed:', err);
      },
    });
  }


  sendResetLink(): void {
    this.loading = true;
    this.userService.getUserByEmail(this.resetPasswordEmail).subscribe({
      next: (user) => {
        console.log(user);
        // User exists, proceed to send the reset link
        this.userService.sendResetPasswordLink(user, this.resetPasswordEmail).subscribe({
          next: () => {
            this.loading = false;
            alert('A password reset link has been sent to your email.');
            this.backToLogin(); // Return to login view
          },
          error: (err) => {
            this.loading = false;
            this.loginError = 'Failed to send reset password link. Please try again.';
            console.error('Error sending reset password link:', err);
          },
        });
      },
      error: (err) => {
        // User not found
        this.loading = false;
        this.loginError = 'The user is not registered. Please contact your admin.';
        console.error('User not found:', err);
      },
    });
  }

  // Send OTP
  sendOtp(): void {
    this.loading = true;
    const fullPhoneNumber = this.selectedCountryCode + this.phone;
    this.authService.verifyPhone(fullPhoneNumber).subscribe({
      next: () => {
        this.loading = false;
        this.isOtpSent = true;
        this.isPhoneSubmitted = true;
        console.log('OTP sent successfully');
      },
      error: (err) => {
        this.loading = false;
        this.loginError = 'Failed to send OTP.';
        console.error('Error:', err);
      },
    });
  }

  // Verify OTP
  verifyOtp(): void {
    this.loading = true;
    const fullPhoneNumber = this.selectedCountryCode + this.phone;
    this.authService.verifyOtp(fullPhoneNumber, this.otp).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['home']); // Redirect to dashboard on success
        this.headerService.showHeaderAndSidenav = true;
      },
      error: (err) => {
        this.loading = false;
        this.loginError = 'Failed to verify OTP.';
        console.error('Error:', err);
      },
    });
  }

  
  
}