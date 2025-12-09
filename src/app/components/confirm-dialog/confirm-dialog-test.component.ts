import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent, ConfirmDialogData } from './confirm-dialog.component';

@Component({
  selector: 'app-confirm-dialog-test',
  template: `
    <div style="padding: 20px; background: #333; color: white; min-height: 100vh;">
      <h2>Confirm Dialog Test</h2>
      
      <div style="margin: 20px 0;">
        <button mat-raised-button color="primary" (click)="testBasicDialog()">
          Test Basic Dialog
        </button>
      </div>
      
      <div style="margin: 20px 0;">
        <button mat-raised-button color="accent" (click)="testWarningDialog()">
          Test Warning Dialog
        </button>
      </div>
      
      <div style="margin: 20px 0;">
        <button mat-raised-button color="warn" (click)="testErrorDialog()">
          Test Error Dialog
        </button>
      </div>
      
      <div style="margin: 20px 0;">
        <button mat-raised-button style="background: #2ecc71; color: white;" (click)="testSuccessDialog()">
          Test Success Dialog
        </button>
      </div>
      
      <div style="margin: 20px 0;">
        <button mat-raised-button style="background: #3498db; color: white;" (click)="testInfoDialog()">
          Test Info Dialog
        </button>
      </div>
    </div>
  `,
  standalone: true,
  imports: [
    ConfirmDialogComponent
  ]
})
export class ConfirmDialogTestComponent {
  
  constructor(private dialog: MatDialog) {}

  testBasicDialog() {
    const dialogData: ConfirmDialogData = {
      title: 'Basic Confirmation',
      message: 'This is a basic confirmation dialog with question type.',
      type: 'question',
      confirmText: 'Yes, proceed',
      cancelText: 'No, cancel'
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: dialogData,
      width: '450px',
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog result:', result);
      alert(`Dialog result: ${result}`);
    });
  }

  testWarningDialog() {
    const dialogData: ConfirmDialogData = {
      title: 'Warning!',
      message: 'This action may have serious consequences. Are you sure you want to proceed?',
      type: 'warning',
      confirmText: 'Yes, I understand',
      cancelText: 'Cancel'
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: dialogData,
      width: '450px',
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Warning dialog result:', result);
      alert(`Warning dialog result: ${result}`);
    });
  }

  testErrorDialog() {
    const dialogData: ConfirmDialogData = {
      title: 'Error Occurred',
      message: 'An error has occurred while processing your request. Please try again later.',
      type: 'error',
      confirmText: 'OK',
      showCancel: false
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: dialogData,
      width: '450px',
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Error dialog result:', result);
      alert(`Error dialog result: ${result}`);
    });
  }

  testSuccessDialog() {
    const dialogData: ConfirmDialogData = {
      title: 'Success!',
      message: 'Your action has been completed successfully. You can now proceed.',
      type: 'success',
      confirmText: 'Continue',
      showCancel: false
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: dialogData,
      width: '450px',
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Success dialog result:', result);
      alert(`Success dialog result: ${result}`);
    });
  }

  testInfoDialog() {
    const dialogData: ConfirmDialogData = {
      title: 'Information',
      message: 'This is an informational message. Please read it carefully before proceeding.',
      type: 'info',
      confirmText: 'Got it',
      showCancel: false
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: dialogData,
      width: '450px',
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Info dialog result:', result);
      alert(`Info dialog result: ${result}`);
    });
  }
} 