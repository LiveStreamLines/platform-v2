import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { SalesOrderService, SalesOrder } from '../../../services/sales-order.service';
import { DeveloperService } from '../../../services/developer.service';
import { Developer } from '../../../models/developer.model';

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
}

@Component({
  selector: 'app-invoicing',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './invoicing.component.html',
  styleUrls: ['./invoicing.component.scss']
})
export class InvoicingComponent implements OnInit {
  invoicingForm: FormGroup;
  salesOrder: SalesOrder | null = null;
  developer: Developer | null = null;
  lineItems: InvoiceLineItem[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private salesOrderService: SalesOrderService,
    private developerService: DeveloperService,
    private dialogRef: MatDialogRef<InvoicingComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { salesOrderId: string }
  ) {
    this.invoicingForm = this.fb.group({
      invoiceDate: [new Date().toISOString().split('T')[0], Validators.required],
      dueDate: ['', Validators.required],
      lineItems: this.fb.array([]),
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadSalesOrder();
  }

  get lineItemsArray() {
    return this.invoicingForm.get('lineItems') as FormArray;
  }

  loadSalesOrder(): void {
    this.isLoading = true;
    this.salesOrderService.getSalesOrderById(this.data.salesOrderId).subscribe({
      next: (salesOrder) => {
        this.salesOrder = salesOrder;
        this.loadDeveloper(salesOrder.customerId);
        this.initializeLineItems();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading sales order:', error);
        this.errorMessage = 'Error loading sales order';
        this.isLoading = false;
      }
    });
  }

  loadDeveloper(customerId: string): void {
    this.developerService.getAllDevelopers().subscribe({
      next: (developers) => {
        this.developer = developers.find(dev => dev._id === customerId) || null;
      },
      error: (error) => {
        console.error('Error loading developer:', error);
      }
    });
  }

  initializeLineItems(): void {
    if (!this.salesOrder) return;

    this.lineItems = this.salesOrder.cameras.map(camera => {
      const invoicedDuration = camera.invoicedDuration || 0;
      const remainingDuration = camera.contractDuration - invoicedDuration;
      
      return {
        cameraId: camera.cameraId,
        cameraName: camera.cameraName,
        totalDuration: camera.contractDuration,
        invoicedDuration: invoicedDuration,
        remainingDuration: remainingDuration,
        monthlyFee: camera.monthlyFee,
        selectedDuration: 0,
        amount: 0,
        include: remainingDuration > 0
      };
    });

    // Initialize form array
    this.lineItemsArray.clear();
    this.lineItems.forEach(item => {
      const lineItem = this.fb.group({
        include: [item.include],
        selectedDuration: [0, [Validators.min(0), Validators.max(item.remainingDuration)]],
        amount: [0]
      });
      this.lineItemsArray.push(lineItem);
    });
  }

  onLineItemChange(index: number): void {
    const lineItem = this.lineItemsArray.at(index);
    const include = lineItem.get('include')?.value;
    const selectedDuration = lineItem.get('selectedDuration')?.value || 0;
    
    if (!include) {
      lineItem.patchValue({
        selectedDuration: 0,
        amount: 0
      });
    } else {
      const item = this.lineItems[index];
      const amount = selectedDuration * item.monthlyFee;
      lineItem.patchValue({ amount: amount });
    }
  }

  calculateTotalAmount(): number {
    return this.lineItemsArray.controls.reduce((total, control) => {
      return total + (control.get('amount')?.value || 0);
    }, 0);
  }

  calculateTotalVat(): number {
    return this.calculateTotalAmount() * 0.05; // 5% VAT
  }

  calculateGrandTotal(): number {
    return this.calculateTotalAmount() + this.calculateTotalVat();
  }

  onSubmit(): void {
    if (this.invoicingForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const formValue = this.invoicingForm.value;
      const totalAmount = this.calculateTotalAmount();
      
      if (totalAmount <= 0) {
        this.errorMessage = 'Please select at least one item with a positive amount';
        this.isLoading = false;
        return;
      }

      // Create invoice data
      const invoiceData = {
        salesOrderId: this.data.salesOrderId,
        invoiceDate: new Date(formValue.invoiceDate),
        dueDate: new Date(formValue.dueDate),
        amount: totalAmount,
        vat: this.calculateTotalVat(),
        grandTotal: this.calculateGrandTotal(),
        lineItems: formValue.lineItems.map((item: any, index: number) => ({
          cameraId: this.lineItems[index].cameraId,
          duration: item.selectedDuration,
          amount: item.amount
        })),
        notes: formValue.notes
      };

      // Here you would call the service to create the invoice
      console.log('Creating invoice:', invoiceData);
      
      // For now, just close the dialog with the invoice data
      this.dialogRef.close(invoiceData);
    } else {
      this.markFormGroupTouched();
    }
  }

  markFormGroupTouched(): void {
    Object.keys(this.invoicingForm.controls).forEach(key => {
      const control = this.invoicingForm.get(key);
      control?.markAsTouched();
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getDeveloperAddress(developer: Developer): string {
    if (!developer.address) return 'No address available';
    
    const address = developer.address;
    const parts = [
      address.street,
      address.city,
      address.state,
      address.zipCode,
      address.country
    ].filter(part => part && part.trim());
    
    return parts.length > 0 ? parts.join(', ') : 'No address available';
  }
} 