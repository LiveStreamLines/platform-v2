import { Component, Inject, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Developer } from '../../../models/developer.model';
import { DeveloperService } from '../../../services/developer.service';
import { environment } from '../../../../environment/environments';

@Component({
  selector: 'app-developer-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './developer-form.component.html',
  styleUrls: ['./developer-form.component.css']
})
export class DeveloperFormComponent implements OnInit {
  developerForm!: FormGroup;
  @Input() isEditMode: boolean = false;
  logoPreview: string | ArrayBuffer | null = null;
  logoFile: File | null = null;

  constructor(
    private fb: FormBuilder, 
    private developerService: DeveloperService,
    private dialogRef: MatDialogRef<DeveloperFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.isEditMode = data.isEditMode;
    }

  ngOnInit(): void {
    this.developerForm = this.fb.group({
      developerName: ['', Validators.required],
      developerTag: ['', Validators.required],
      description: ['', Validators.required],
      isActive: [true],
      // Contact Information
      email: ['', [Validators.email]],
      phone: [''],
      website: [''],
      // Business Information
      vatNumber: [''],
      taxId: [''],
      businessLicense: [''],
      // Address Information
      address: this.fb.group({
        street: [''],
        city: [''],
        state: [''],
        zipCode: [''],
        country: ['']
      }),
      // Contact Person
      contactPerson: this.fb.group({
        name: [''],
        position: [''],
        email: ['', [Validators.email]],
        phone: ['']
      }),
      // Bank Details
      bankDetails: this.fb.group({
        bankName: [''],
        accountNumber: [''],
        iban: [''],
        swiftCode: ['']
      })
    });
    if (this.isEditMode && this.data.developer) {
      this.populateForm(this.data.developer);
    }
  }

  populateForm(developer: Developer): void {
    this.developerForm.patchValue({
      developerName: developer.developerName,
      developerTag: developer.developerTag,
      description: developer.description,
      isActive: developer.isActive,
      email: developer.email || '',
      phone: developer.phone || '',
      website: developer.website || '',
      vatNumber: developer.vatNumber || '',
      taxId: developer.taxId || '',
      businessLicense: developer.businessLicense || '',
      address: {
        street: developer.address?.street || '',
        city: developer.address?.city || '',
        state: developer.address?.state || '',
        zipCode: developer.address?.zipCode || '',
        country: developer.address?.country || ''
      },
      contactPerson: {
        name: developer.contactPerson?.name || '',
        position: developer.contactPerson?.position || '',
        email: developer.contactPerson?.email || '',
        phone: developer.contactPerson?.phone || ''
      },
      bankDetails: {
        bankName: developer.bankDetails?.bankName || '',
        accountNumber: developer.bankDetails?.accountNumber || '',
        iban: developer.bankDetails?.iban || '',
        swiftCode: developer.bankDetails?.swiftCode || ''
      }
    });
    this.logoPreview = environment.images + '/' + developer.logo; // Show the existing logo if editing
  }

  onLogoChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.logoFile = input.files[0];
      
      // Generate a preview
      const reader = new FileReader();
      reader.onload = () => {
        this.logoPreview = reader.result;
      };
      reader.readAsDataURL(this.logoFile);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.developerForm.valid) {
      const developerData = this.developerForm.value;
  
      // Prepare FormData for the backend
      const formData = new FormData();
      formData.append('developerName', developerData.developerName);
      formData.append('developerTag', developerData.developerTag);
      formData.append('description', developerData.description);
      formData.append('isActive', developerData.isActive);
      
      // Contact Information
      formData.append('email', developerData.email || '');
      formData.append('phone', developerData.phone || '');
      formData.append('website', developerData.website || '');
      
      // Business Information
      formData.append('vatNumber', developerData.vatNumber || '');
      formData.append('taxId', developerData.taxId || '');
      formData.append('businessLicense', developerData.businessLicense || '');
      
      // Address Information
      formData.append('address[street]', developerData.address?.street || '');
      formData.append('address[city]', developerData.address?.city || '');
      formData.append('address[state]', developerData.address?.state || '');
      formData.append('address[zipCode]', developerData.address?.zipCode || '');
      formData.append('address[country]', developerData.address?.country || '');
      
      // Contact Person
      formData.append('contactPerson[name]', developerData.contactPerson?.name || '');
      formData.append('contactPerson[position]', developerData.contactPerson?.position || '');
      formData.append('contactPerson[email]', developerData.contactPerson?.email || '');
      formData.append('contactPerson[phone]', developerData.contactPerson?.phone || '');
      
      // Bank Details
      formData.append('bankDetails[bankName]', developerData.bankDetails?.bankName || '');
      formData.append('bankDetails[accountNumber]', developerData.bankDetails?.accountNumber || '');
      formData.append('bankDetails[iban]', developerData.bankDetails?.iban || '');
      formData.append('bankDetails[swiftCode]', developerData.bankDetails?.swiftCode || '');
  
      // Append logo file if present
      if (this.logoFile) {
        formData.append('logo', this.logoFile);
      } else if (this.isEditMode && this.data.developer.logo) {
        // In edit mode, if no new logo is uploaded, keep the existing logo reference
        formData.append('logo', this.data.developer.logo);
      }
  
      // Call service method to submit the data
      this.developerService.addOrUpdateDeveloper(formData, this.isEditMode, this.data?.developer?._id).subscribe(
      {
        next: (response) => {
          console.log('Developer submitted successfully:', response);
          this.dialogRef.close(response); // Close dialog on success
        },
        error: (error) => {
          console.error('Error submitting developer:', error);
        }
      });
    }
  }
      
}
