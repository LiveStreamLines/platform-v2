import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';  // Import FormsModule for ngModel
import { CommonModule } from '@angular/common'; // Import CommonModule for ngFor and ngIf
import { MatFormField } from '@angular/material/input';
import { MatInputModule } from '@angular/material/input';
import { MatLabel } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { DeveloperService } from '../../services/developer.service';
import { Developer } from '../../models/developer.model';
import { DeveloperFormComponent } from './developer-form/developer-form.component';
import { environment } from '../../../environment/environments';

@Component({
  selector: 'app-developers',
  standalone: true,
  imports: [FormsModule, CommonModule, MatFormField, MatInputModule, 
    MatLabel, MatSort, MatTableModule, MatIcon],
  templateUrl: './developers.component.html',
  styleUrl: './developers.component.css'
})

export class DevelopersComponent implements OnInit {

  displayedColumns: string[] = ['logo', 'name', 'status', 'createdDate', 'actions'];
  dataSource = new MatTableDataSource<Developer>();
  searchTerm: string = '';
  link: string = environment.images;
  @ViewChild(MatSort) sort!: MatSort;  // Sort for the table


  constructor(private developerService: DeveloperService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.fetchDevelopers();
  }

  // Fetch developers and populate the table data
  fetchDevelopers(): void {
    this.developerService.getAllDevelopers().subscribe((developers) => {
      this.dataSource.data = developers;
    });
  }

  // Open the form in "Add" mode
  openAddDeveloperDialog(): void {
    const dialogRef = this.dialog.open(DeveloperFormComponent, {
      data: { isEditMode: false },
      panelClass: 'custom-dialog-container',
      // width: '700px',      // Set desired width
      // maxHeight: '80vh'   // Limit height to 80% of viewport height
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fetchDevelopers();  // Refresh list after adding a new developer
      }
    });
  }

  // Open the form in "Edit" mode
  openEditDeveloperDialog(developer: Developer): void {
    const dialogRef = this.dialog.open(DeveloperFormComponent, {
      data: { isEditMode: true, developer },
      panelClass: 'custom-dialog-container',
      // width: '700px',      // Set desired width
      // maxHeight: '80vh'   // Limit height to 80% of viewport height
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fetchDevelopers();  // Refresh list after editing a developer
      }
    });
  }

  // Apply filter for search functionality
  applyFilter(): void {
    this.dataSource.filter = this.searchTerm.trim().toLowerCase();
  }



}
