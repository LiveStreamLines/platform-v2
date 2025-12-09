import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { UserService } from '../../../services/users.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-relocation-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    MatSelectModule, 
    MatFormFieldModule, 
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './relocation-dialog.component.html',
  styleUrl: './relocation-dialog.component.css'
})
export class RelocationDialogComponent {
  admins: User[] = [];
  selectedAdminId: string | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private userService: UserService,
    public dialogRef: MatDialogRef<RelocationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.loadAdmins();
  }

  loadAdmins(): void {
    this.loading = true;
    this.error = null;
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        // Filter users with Admin or Super Admin role
        this.admins = users.filter(user => 
          user.role === 'Admin' || user.role === 'Super Admin'
        );
        // Sort by role (Super Admin first, then Admin) and then by name
        this.admins.sort((a, b) => {
          if (a.role === b.role) {
            return a.name.localeCompare(b.name);
          }
          return a.role === 'Super Admin' ? -1 : 1;
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading admins:', err);
        this.error = 'Failed to load admin users';
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.selectedAdminId) {
      this.dialogRef.close({
        adminId: this.selectedAdminId
      });
    }
  }
}
