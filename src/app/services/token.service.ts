import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environment/environments';
import { AuthService } from './auth.service'; // Import AuthService
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private apiUrl = environment.backend + '/api/tokens'; // Backend endpoint

  constructor(private http: HttpClient, private authService: AuthService) {}

  /**
   * Save tokens and expiry times in the backend
   */
  saveTokens(accessToken: string, accessTokenExpiry: number, streamToken: string, streamTokenExpiry: number): Observable<any> {
   // const authh = this.authService.getAuthToken();
   // const headers = new HttpHeaders({ 'Authorization': authh ? `Bearer ${authh}` : '' });

    const body = {
      token1: accessToken,
      token1Exp: accessTokenExpiry.toString(),
      token2: streamToken,
      token2Exp: streamTokenExpiry.toString()
    };

    console.log("Saving tokens with body:", body);
//    return this.http.post(`${this.apiUrl}/save`, body, { headers });
    return this.http.post(`${this.apiUrl}/save`, body);

  }

  getAllTokens(): Observable<{ accessToken: string, accessTokenExpiry: number, streamToken: string, streamTokenExpiry: number }> {
    //const authh = this.authService.getAuthToken();
    //const headers = new HttpHeaders({ 'Authorization': authh ? `Bearer ${authh}` : '' });

    return this.http.get<any>(`${this.apiUrl}/all`).pipe(
      tap(response => console.log("All Tokens Fetched:", response)),
      map(response => {
        if (!response || !response[0]) {
          throw new Error('No tokens found in response');
        }
        
        const tokenData = response[0];
        console.log("Token data mapping:", {
          token1: tokenData.token1,
          token1Exp: tokenData.token1Exp,
          token2: tokenData.token2,
          token2Exp: tokenData.token2Exp
        });
        
        return {
          accessToken: tokenData.token1,
          accessTokenExpiry: parseInt(tokenData.token1Exp),
          streamToken: tokenData.token2,
          streamTokenExpiry: parseInt(tokenData.token2Exp)
        };
      })
    );
  }
}
