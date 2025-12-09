import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Skip interception for login/auth endpoints (they handle their own errors)
      const isAuthEndpoint = req.url.includes('/api/auth/login') || 
                             req.url.includes('/api/auth/reset') ||
                             req.url.includes('/api/otp');
      
      if (isAuthEndpoint) {
        return throwError(() => error);
      }

      // Check if it's a 403 error (forbidden - forced logout, expired, or invalid token)
      if (error.status === 403) {
        const errorMessage = (error.error?.msg || error.message || '').toLowerCase();
        
        // Check if it's authentication-related (forced logout, expired, or invalid token)
        // Backend returns various messages:
        // - "Your session has been terminated. Please log in again." (forced logout)
        // - "Invalid or expired token" (expired/invalid JWT)
        if (errorMessage.includes('session has been terminated') || 
            errorMessage.includes('terminated') ||
            errorMessage.includes('blacklisted') ||
            errorMessage.includes('please log in again') ||
            errorMessage.includes('invalid or expired token') ||
            errorMessage.includes('expired') ||
            errorMessage.includes('invalid token')) {
          
          console.log('Authentication error detected - logging out user');
          console.log('Error message:', error.error?.msg || error.message);
          
          // Log out the user (clears localStorage and resets state)
          authService.logout();
          
          // Redirect to login page
          router.navigate(['/login']);
          
          // Return error to prevent further processing
          return throwError(() => error);
        }
      }
      
      // Handle 401 unauthorized errors (token missing or invalid)
      if (error.status === 401) {
        const errorMessage = (error.error?.msg || error.message || '').toLowerCase();
        if (errorMessage.includes('token missing') || 
            errorMessage.includes('authorization token missing') ||
            errorMessage.includes('unauthorized')) {
          // Only logout if user was previously logged in
          if (authService.isLoggedIn()) {
            console.log('Authorization required - logging out');
            authService.logout();
            router.navigate(['/login']);
          }
        }
      }
      
      // For other errors, just pass them through
      return throwError(() => error);
    })
  );
};

