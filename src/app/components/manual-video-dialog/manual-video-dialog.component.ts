import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserService } from '../../services/users.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-manual-video-dialog',
  standalone: true,
  imports: [MatDialogModule, CommonModule, FormsModule, MatCheckboxModule],
  templateUrl: './manual-video-dialog.component.html',
  styleUrl: './manual-video-dialog.component.css'
})
export class ManualVideoDialogComponent {

  dontShowAgain = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { title: string; videoUrl: string },
  private dialogRef: MatDialogRef<ManualVideoDialogComponent>,
  private userService: UserService,
  private authService: AuthService
) {
    console.log('Received data:', data);
    this.dontShowAgain = this.authService.getManual() === "true" ? true : false;
  }

  ngOnInit() {
    // This ensures the video is reset when the dialog opens
    const videoElement = document.querySelector('video');
    if (videoElement) {
      videoElement.load(); // Reloads the video
    }
  }

  closeDialog() {
    if (this.dontShowAgain) {
      // Save preference in local storage
      const userId = this.authService.getUserId();
      const userData = {manual: true};
      this.userService.updateUser(userId!, userData).subscribe(() => 
        {
          console.log("not show manual set to the user");
        }
      )
    }
    this.dialogRef.close();
  }

}
