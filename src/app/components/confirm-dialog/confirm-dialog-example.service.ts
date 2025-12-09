import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent, ConfirmDialogData, DialogType } from './confirm-dialog.component';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogExampleService {

  constructor(private dialog: MatDialog) {}

  /**
   * Show a basic confirmation dialog
   */
  showConfirm(title: string, message: string): Observable<boolean> {
    const dialogData: ConfirmDialogData = {
      title,
      message,
      type: 'question'
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: dialogData,
      width: '450px',
      disableClose: false,
      panelClass: 'custom-dialog-container'
    });

    return dialogRef.afterClosed();
  }

  /**
   * Show a warning dialog
   */
  showWarning(title: string, message: string): Observable<boolean> {
    const dialogData: ConfirmDialogData = {
      title,
      message,
      type: 'warning',
      confirmText: 'Proceed',
      cancelText: 'Cancel'
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: dialogData,
      width: '450px',
      disableClose: false
    });

    return dialogRef.afterClosed();
  }

  /**
   * Show an error dialog
   */
  showError(title: string, message: string): Observable<boolean> {
    const dialogData: ConfirmDialogData = {
      title,
      message,
      type: 'error',
      confirmText: 'OK',
      showCancel: false
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: dialogData,
      width: '450px',
      disableClose: false
    });

    return dialogRef.afterClosed();
  }

  /**
   * Show an info dialog
   */
  showInfo(title: string, message: string): Observable<boolean> {
    const dialogData: ConfirmDialogData = {
      title,
      message,
      type: 'info',
      confirmText: 'Got it',
      showCancel: false
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: dialogData,
      width: '450px',
      disableClose: false
    });

    return dialogRef.afterClosed();
  }

  /**
   * Show a success dialog
   */
  showSuccess(title: string, message: string): Observable<boolean> {
    const dialogData: ConfirmDialogData = {
      title,
      message,
      type: 'success',
      confirmText: 'Continue',
      showCancel: false
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: dialogData,
      width: '450px',
      disableClose: false
    });

    return dialogRef.afterClosed();
  }

  /**
   * Show a delete confirmation dialog
   */
  showDeleteConfirm(itemName: string): Observable<boolean> {
    const dialogData: ConfirmDialogData = {
      title: 'Delete Confirmation',
      message: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
      type: 'warning',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmColor: 'warn'
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: dialogData,
      width: '450px',
      disableClose: false
    });

    return dialogRef.afterClosed();
  }

  /**
   * Show a custom dialog with specific configuration
   */
  showCustomDialog(config: ConfirmDialogData): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: config,
      width: '450px',
      disableClose: false
    });

    return dialogRef.afterClosed();
  }
} 