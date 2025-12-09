import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators, FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { SalesOrderService, SalesOrder } from '../../../services/sales-order.service';
import { Developer } from '../../../models/developer.model';
import { CameraService } from '../../../services/camera.service';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

interface InvoiceLineItem {
  cameraId: string;
  cameraName: string;
  totalDuration: number;
  invoicedDuration: number;
  remainingDuration: number;
  monthlyFee: number;
  selectedDuration: number;
  amount: number;
  include: boolean;
  totalInvoicedAmount: number;
  remainingAmount: number;
}

interface InvoiceData {
  invoiceNumber: string;
  invoiceSequence: number;
  dueDate: Date;
  amount: number;
  status: 'Pending' | 'Paid' | 'Overdue';
  description: string;
  generatedDate: Date;
}

@Component({
  selector: 'app-invoice-generation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    MatTableModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './invoice-generation-dialog.component.html',
  styleUrls: ['./invoice-generation-dialog.component.css']
})
export class InvoiceGenerationDialogComponent implements OnInit {
  invoiceForm: FormGroup;
  lineItems: InvoiceLineItem[] = [];
  selectedDeveloper: Developer | null = null;
  salesOrder: SalesOrder;
  invoiceType: 'manual' | 'automatic' = 'manual';
  automaticType: 'onOrder' | 'onInstallation' | 'installment' = 'onOrder';
  installmentPeriodicity: 'monthly' | 'quarterly' | 'halfYear' = 'monthly';
  installmentTiming: 'start' | 'end' = 'start';
  automaticTrigger: 'order' | 'installation' | 'installments' = 'order';
  installmentAmount: number = 0;
  allSelected: boolean = false;
  someSelected: boolean = false;
  
  // Table columns for manual invoicing
  displayedColumns: string[] = ['include', 'cameraName', 'totalDuration', 'invoicedDuration', 'remainingDuration', 'selectedDuration', 'amount'];

  constructor(
    private fb: FormBuilder,
    private salesOrderService: SalesOrderService,
    private cameraService: CameraService,
    private dialogRef: MatDialogRef<InvoiceGenerationDialogComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: {
      salesOrder: SalesOrder;
      developer: Developer;
    }
  ) {
    this.salesOrder = data.salesOrder;
    this.selectedDeveloper = data.developer;
    
    this.invoiceForm = this.fb.group({
      invoiceType: ['manual', Validators.required],
      automaticType: ['onOrder'],
      onOrderAmount: [0, [Validators.min(0)]],
      onOrderPercentage: [0, [Validators.min(0), Validators.max(100)]],
      onInstallationAmount: [0, [Validators.min(0)]],
      onInstallationPercentage: [0, [Validators.min(0), Validators.max(100)]],
      installationDate: [''],
      installmentPeriodicity: ['monthly'],
      installmentTiming: ['start'],
      installmentAmount: [0, [Validators.min(0)]],
      installmentPercentage: [0, [Validators.min(0), Validators.max(100)]]
    });
  }

  ngOnInit(): void {
    // Check if the sales order can be invoiced (must be Confirmed or higher)
    if (this.salesOrder.status === 'Draft') {
      this.snackBar.open('Cannot generate invoices for Draft orders. Please confirm the sales order first.', 'Close', { duration: 5000 });
      this.dialogRef.close();
      return;
    }

    this.initializeLineItems();
    this.setupFormListeners();
  }

  initializeLineItems(): void {
    this.lineItems = this.salesOrder.cameras.map(camera => {
      // Use the camera's invoicedDuration field for accurate tracking
      const totalInvoicedDuration = camera.invoicedDuration || 0;
      const totalInvoicedAmount = totalInvoicedDuration * camera.monthlyFee;
      
      return {
        cameraId: camera.cameraId,
        cameraName: camera.cameraName,
        totalDuration: camera.contractDuration,
        invoicedDuration: totalInvoicedDuration,
        remainingDuration: Math.max(0, camera.contractDuration - totalInvoicedDuration),
        monthlyFee: camera.monthlyFee,
        selectedDuration: 0,
        amount: 0,
        include: false,
        totalInvoicedAmount: totalInvoicedAmount,
        remainingAmount: Math.max(0, (camera.contractDuration * camera.monthlyFee) - totalInvoicedAmount)
      };
    });
  }

  calculateInvoicedAmountForCamera(cameraId: string): number {
    if (!this.salesOrder.invoices || this.salesOrder.invoices.length === 0) {
      return 0;
    }

    // Use the camera's invoicedDuration to calculate the amount
    const camera = this.salesOrder.cameras.find(c => c.cameraId === cameraId);
    if (!camera) return 0;

    const invoicedDuration = camera.invoicedDuration || 0;
    return invoicedDuration * camera.monthlyFee;
  }

  calculateInvoicedDurationForCamera(cameraId: string): number {
    if (!this.salesOrder.invoices || this.salesOrder.invoices.length === 0) {
      return 0;
    }

    // For manual invoices, we need to track which cameras are being invoiced
    // Since we don't have detailed tracking, we'll use the camera's invoicedDuration field
    const camera = this.salesOrder.cameras.find(c => c.cameraId === cameraId);
    if (!camera) return 0;

    // Use the camera's invoicedDuration field if it exists, otherwise calculate from invoices
    if (camera.invoicedDuration !== undefined && camera.invoicedDuration !== null) {
      return camera.invoicedDuration;
    }

    // Fallback calculation - this should be avoided by properly updating camera.invoicedDuration
    const totalInvoicedAmount = this.salesOrder.invoices.reduce((total, invoice) => {
      return total + invoice.amount;
    }, 0);

    // Calculate how many months of this camera have been invoiced
    // This is a simplified calculation and should be replaced with proper tracking
    return Math.floor(totalInvoicedAmount / camera.monthlyFee);
  }

  calculateTotalRemainingAmount(): number {
    return this.lineItems.reduce((total, item) => {
      return total + item.remainingAmount;
    }, 0);
  }

  calculateTotalInvoicedAmount(): number {
    return this.lineItems.reduce((total, item) => {
      return total + item.totalInvoicedAmount;
    }, 0);
  }

  calculateTotalSelectedAmount(): number {
    return this.lineItems
      .filter(item => item.include)
      .reduce((total, item) => total + item.amount, 0);
  }

  isFullyInvoiced(): boolean {
    return this.calculateTotalRemainingAmount() <= 0;
  }

  getInvoiceProgress(): { invoiced: number; total: number; percentage: number } {
    const totalContractValue = this.salesOrder.cameras.reduce((total, camera) => {
      return total + (camera.contractDuration * camera.monthlyFee);
    }, 0);
    
    const invoicedAmount = this.calculateTotalInvoicedAmount();
    const percentage = totalContractValue > 0 ? (invoicedAmount / totalContractValue) * 100 : 0;
    
    return {
      invoiced: invoicedAmount,
      total: totalContractValue,
      percentage: Math.round(percentage)
    };
  }

  setupFormListeners(): void {
    this.invoiceForm.get('invoiceType')?.valueChanges.subscribe(type => {
      this.invoiceType = type;
      this.updateFormValidation();
    });

    this.invoiceForm.get('automaticType')?.valueChanges.subscribe(type => {
      this.automaticType = type;
      this.updateFormValidation();
    });
  }

  updateFormValidation(): void {
    const onOrderAmountControl = this.invoiceForm.get('onOrderAmount');
    const onOrderPercentageControl = this.invoiceForm.get('onOrderPercentage');
    const onInstallationAmountControl = this.invoiceForm.get('onInstallationAmount');
    const onInstallationPercentageControl = this.invoiceForm.get('onInstallationPercentage');
    const installationDateControl = this.invoiceForm.get('installationDate');
    const installmentAmountControl = this.invoiceForm.get('installmentAmount');
    const installmentPercentageControl = this.invoiceForm.get('installmentPercentage');

    if (this.invoiceType === 'automatic') {
      if (this.automaticType === 'onOrder') {
        onOrderAmountControl?.setValidators([Validators.min(0)]);
        onOrderPercentageControl?.setValidators([Validators.min(0), Validators.max(100)]);
        onInstallationAmountControl?.clearValidators();
        onInstallationPercentageControl?.clearValidators();
        installationDateControl?.clearValidators();
        installmentAmountControl?.clearValidators();
        installmentPercentageControl?.clearValidators();
      } else if (this.automaticType === 'onInstallation') {
        onOrderAmountControl?.clearValidators();
        onOrderPercentageControl?.clearValidators();
        onInstallationAmountControl?.setValidators([Validators.min(0)]);
        onInstallationPercentageControl?.setValidators([Validators.min(0), Validators.max(100)]);
        installationDateControl?.setValidators([Validators.required]);
        installmentAmountControl?.clearValidators();
        installmentPercentageControl?.clearValidators();
      } else if (this.automaticType === 'installment') {
        onOrderAmountControl?.clearValidators();
        onOrderPercentageControl?.clearValidators();
        onInstallationAmountControl?.clearValidators();
        onInstallationPercentageControl?.clearValidators();
        installationDateControl?.setValidators([Validators.required]);
        installmentAmountControl?.setValidators([Validators.min(0)]);
        installmentPercentageControl?.setValidators([Validators.min(0), Validators.max(100)]);
      }
    } else {
      // Manual mode - clear all automatic validators
      onOrderAmountControl?.clearValidators();
      onOrderPercentageControl?.clearValidators();
      onInstallationAmountControl?.clearValidators();
      onInstallationPercentageControl?.clearValidators();
      installationDateControl?.clearValidators();
      installmentAmountControl?.clearValidators();
      installmentPercentageControl?.clearValidators();
    }

    // Update validity
    [onOrderAmountControl, onOrderPercentageControl, onInstallationAmountControl, 
     onInstallationPercentageControl, installationDateControl, installmentAmountControl, 
     installmentPercentageControl].forEach(control => control?.updateValueAndValidity());
  }

  onLineItemChange(item: InvoiceLineItem): void {
    if (item.include && item.selectedDuration > 0) {
      item.amount = item.selectedDuration * item.monthlyFee;
    } else {
      item.amount = 0;
    }
  }

  generateManualInvoice(): Observable<InvoiceData[]> {
    const selectedItems = this.lineItems.filter(item => item.include && item.amount > 0);
    if (selectedItems.length === 0) {
      return new Observable(observer => observer.next([]));
    }

    return new Observable(observer => {
      const newInvoices: InvoiceData[] = [];
      
      // Use sales order's own invoice sequence count for the invoice number
      const nextSequence = this.salesOrder.invoices ? this.salesOrder.invoices.length + 1 : 1;
      const currentYear = new Date().getFullYear();
      const invoiceNumber = `INV-${currentYear}-${nextSequence.toString().padStart(4, '0')}`;

      selectedItems.forEach((item, index) => {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30); // 30 days from now

        newInvoices.push({
          invoiceNumber: invoiceNumber, // Same invoice number for all items in this generation batch
          invoiceSequence: nextSequence, // Sales order's own sequence (1, 2, 3, etc.)
          dueDate: dueDate,
          amount: item.amount,
          status: 'Pending' as const,
          description: `Invoice for ${item.cameraName} - ${item.selectedDuration} months`,
          generatedDate: new Date()
        });
      });

      observer.next(newInvoices);
      observer.complete();
    });
  }

  generateAutomaticInvoice(): Observable<InvoiceData[]> {
    const totalContractValue = this.salesOrder.cameras.reduce((total, camera) => {
      return total + (camera.contractDuration * camera.monthlyFee);
    }, 0);

    let invoiceAmount = 0;
    let description = '';

    switch (this.automaticTrigger) {
      case 'order':
        invoiceAmount = totalContractValue;
        description = 'Full contract value invoiced on order';
        break;
      case 'installation':
        invoiceAmount = totalContractValue;
        description = 'Full contract value invoiced on installation';
        break;
      case 'installments':
        invoiceAmount = this.installmentAmount;
        description = `Monthly installment of ${this.installmentAmount}`;
        break;
    }

    if (invoiceAmount <= 0) {
      return new Observable(observer => observer.next([]));
    }

    return new Observable(observer => {
      // Use sales order's own invoice sequence count for the invoice number
      const nextSequence = this.salesOrder.invoices ? this.salesOrder.invoices.length + 1 : 1;
      const currentYear = new Date().getFullYear();
      const invoiceNumber = `INV-${currentYear}-${nextSequence.toString().padStart(4, '0')}`;

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);

      const newInvoices = [{
        invoiceNumber: invoiceNumber, // Unique invoice number for this generation batch
        invoiceSequence: nextSequence, // Sales order's own sequence (1, 2, 3, etc.)
        dueDate: dueDate,
        amount: invoiceAmount,
        status: 'Pending' as const,
        description: description,
        generatedDate: new Date()
      }];

      observer.next(newInvoices);
      observer.complete();
    });
  }

  calculateUpdatedCameraInvoicedDurations(newInvoices: InvoiceData[]): { cameraId: string; invoicedDuration: number }[] {
    console.log('Calculating updated camera invoiced durations...');
    console.log('Current sales order cameras:', this.salesOrder.cameras);
    console.log('New invoices:', newInvoices);
    
    // For manual invoices, we know exactly which cameras are being invoiced
    if (this.invoiceType === 'manual') {
      const result = this.salesOrder.cameras.map(camera => {
        const lineItem = this.lineItems.find(item => item.cameraId === camera.cameraId);
        const currentInvoicedDuration = camera.invoicedDuration || 0;
        
        console.log(`Camera ${camera.cameraName}:`);
        console.log(`  - Current invoiced duration: ${currentInvoicedDuration}`);
        console.log(`  - Contract duration: ${camera.contractDuration}`);
        console.log(`  - Line item found: ${!!lineItem}`);
        
        if (lineItem && lineItem.include && lineItem.selectedDuration > 0) {
          // This camera is being invoiced in this batch
          const newInvoicedDuration = currentInvoicedDuration + lineItem.selectedDuration;
          const finalDuration = Math.min(newInvoicedDuration, camera.contractDuration);
          
          console.log(`  - Selected duration: ${lineItem.selectedDuration}`);
          console.log(`  - New invoiced duration: ${newInvoicedDuration}`);
          console.log(`  - Final invoiced duration: ${finalDuration}`);
          
          return {
            cameraId: camera.cameraId,
            invoicedDuration: finalDuration
          };
        } else {
          // This camera is not being invoiced in this batch
          console.log(`  - Not being invoiced in this batch`);
          return {
            cameraId: camera.cameraId,
            invoicedDuration: currentInvoicedDuration
          };
        }
      });
      
      console.log('Final manual invoice result:', result);
      return result;
    }

    // For automatic invoices, distribute proportionally
    const totalInvoicedAmount = newInvoices.reduce((total, invoice) => total + invoice.amount, 0);
    const existingInvoicedAmount = this.salesOrder.invoices ? 
      this.salesOrder.invoices.reduce((total, invoice) => total + invoice.amount, 0) : 0;
    const totalInvoicedAmountAfterNew = totalInvoicedAmount + existingInvoicedAmount;

    const totalContractValue = this.salesOrder.cameras.reduce((total, camera) => {
      return total + (camera.contractDuration * camera.monthlyFee);
    }, 0);

    const result = this.salesOrder.cameras.map(camera => {
      const cameraTotalValue = camera.contractDuration * camera.monthlyFee;
      const proportion = cameraTotalValue / totalContractValue;
      const cameraInvoicedAmount = totalInvoicedAmountAfterNew * proportion;
      const invoicedDuration = Math.floor(cameraInvoicedAmount / camera.monthlyFee);
      
      return {
        cameraId: camera.cameraId,
        invoicedDuration: Math.min(invoicedDuration, camera.contractDuration)
      };
    });
    
    console.log('Final automatic invoice result:', result);
    return result;
  }

  generateInvoice(): void {
    let invoiceObservable: Observable<InvoiceData[]>;

    if (this.invoiceType === 'manual') {
      invoiceObservable = this.generateManualInvoice();
    } else {
      invoiceObservable = this.generateAutomaticInvoice();
    }

    invoiceObservable.subscribe({
      next: (newInvoices) => {
        if (newInvoices.length === 0) {
          console.log('No invoices to generate');
          return;
        }

        // Calculate updated invoiced durations for cameras
        const updatedCameraDurations = this.calculateUpdatedCameraInvoicedDurations(newInvoices);

        // Update the sales order with new invoices and camera invoiced durations
        const updatedInvoices = [...(this.salesOrder.invoices || []), ...newInvoices];
        
        // Update camera invoiced durations
        const updatedCameras = this.salesOrder.cameras.map(camera => {
          const updatedDuration = updatedCameraDurations.find(d => d.cameraId === camera.cameraId);
          return {
            ...camera,
            invoicedDuration: updatedDuration ? updatedDuration.invoicedDuration : (camera.invoicedDuration || 0)
          };
        });

        const updateData: Partial<SalesOrder> = {
          invoices: updatedInvoices,
          cameras: updatedCameras,
          status: this.isFullyInvoiced() ? 'Invoiced' as const : 'Confirmed' as const
        };

        // First update the sales order
        this.salesOrderService.updateSalesOrder(this.salesOrder._id, updateData).subscribe({
          next: (updatedSalesOrder) => {
            console.log('Sales order updated successfully:', updatedSalesOrder);
            
            // Now update individual camera records with invoice information
            const cameraUpdateObservables: Observable<any>[] = [];
            
            // For manual invoices, update only the cameras that were invoiced
            if (this.invoiceType === 'manual') {
              this.lineItems.forEach(lineItem => {
                if (lineItem.include && lineItem.selectedDuration > 0) {
                  // Find the corresponding invoice for this camera
                  const cameraInvoice = newInvoices.find(invoice => 
                    invoice.description.includes(lineItem.cameraName)
                  );
                  
                  if (cameraInvoice) {
                    // Update camera with invoice info
                    const invoiceData = {
                      invoiceNumber: cameraInvoice.invoiceNumber,
                      invoiceSequence: cameraInvoice.invoiceSequence,
                      amount: lineItem.amount,
                      duration: lineItem.selectedDuration,
                      generatedDate: cameraInvoice.generatedDate,
                      status: cameraInvoice.status
                    };
                    
                    cameraUpdateObservables.push(
                      this.cameraService.updateCameraInvoiceInfo(lineItem.cameraId, invoiceData)
                    );
                    
                    // Update camera invoiced duration
                    const updatedDuration = updatedCameraDurations.find(d => d.cameraId === lineItem.cameraId);
                    if (updatedDuration) {
                      cameraUpdateObservables.push(
                        this.cameraService.updateCameraInvoicedDuration(lineItem.cameraId, updatedDuration.invoicedDuration)
                      );
                    }
                  }
                }
              });
            } else {
              // For automatic invoices, update all cameras proportionally
              this.salesOrder.cameras.forEach(camera => {
                const updatedDuration = updatedCameraDurations.find(d => d.cameraId === camera.cameraId);
                if (updatedDuration) {
                  cameraUpdateObservables.push(
                    this.cameraService.updateCameraInvoicedDuration(camera.cameraId, updatedDuration.invoicedDuration)
                  );
                }
              });
            }
            
            // Execute all camera updates
            if (cameraUpdateObservables.length > 0) {
              forkJoin(cameraUpdateObservables).subscribe({
                next: (results) => {
                  console.log('Camera records updated successfully:', results);
                  this.snackBar.open('Invoice generated and camera records updated successfully', 'Close', { duration: 3000 });
                  this.dialogRef.close({
                    success: true,
                    salesOrder: updatedSalesOrder,
                    newInvoices: newInvoices
                  });
                },
                error: (error) => {
                  console.error('Error updating camera records:', error);
                  this.snackBar.open('Invoice generated but there was an error updating camera records', 'Close', { duration: 3000 });
                  this.dialogRef.close({
                    success: true,
                    salesOrder: updatedSalesOrder,
                    newInvoices: newInvoices
                  });
                }
              });
            } else {
              console.log('Invoice generated successfully:', newInvoices);
              this.snackBar.open('Invoice generated successfully', 'Close', { duration: 3000 });
              this.dialogRef.close({
                success: true,
                salesOrder: updatedSalesOrder,
                newInvoices: newInvoices
              });
            }
          },
          error: (error) => {
            console.error('Error generating invoice:', error);
            this.snackBar.open('Error generating invoice', 'Close', { duration: 3000 });
          }
        });
      },
      error: (error) => {
        console.error('Error generating invoice:', error);
        this.snackBar.open('Error generating invoice', 'Close', { duration: 3000 });
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  calculateAmount(index: number): void {
    const item = this.lineItems[index];
    if (item.include && item.selectedDuration > 0) {
      item.amount = item.selectedDuration * item.monthlyFee;
    } else {
      item.amount = 0;
    }
  }

  updateSelection(): void {
    const selectedItems = this.lineItems.filter(item => item.include);
    this.allSelected = selectedItems.length === this.lineItems.length && this.lineItems.length > 0;
    this.someSelected = selectedItems.length > 0 && selectedItems.length < this.lineItems.length;
  }

  toggleAll(event: any): void {
    this.lineItems.forEach(item => {
      if (item.remainingDuration > 0) {
        item.include = event.checked;
        if (event.checked) {
          item.selectedDuration = item.remainingDuration;
          item.amount = item.selectedDuration * item.monthlyFee;
        } else {
          item.selectedDuration = 0;
          item.amount = 0;
        }
      }
    });
    this.updateSelection();
  }

  canGenerateInvoice(): boolean {
    if (this.invoiceType === 'manual') {
      return this.lineItems.some(item => item.include && item.amount > 0);
    } else if (this.invoiceType === 'automatic') {
      if (this.automaticTrigger === 'installments') {
        return this.installmentAmount > 0;
      }
      return true;
    }
    return false;
  }
} 