import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SalesOrderService, SalesOrder } from '../../../services/sales-order.service';
import { DeveloperService } from '../../../services/developer.service';
import { Developer } from '../../../models/developer.model';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';

interface InvoiceItem {
  invoiceNumber: string;
  invoiceSequence: number;
  dueDate: Date;
  amount: number;
  status: 'Pending' | 'Paid' | 'Overdue';
  description: string;
  generatedDate: Date;
  vat?: number;
  grandTotal?: number;
  notes?: string;
}

@Component({
  selector: 'app-invoice-edit',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule
  ],

  templateUrl: './invoice-edit.component.html',
  styleUrls: ['./invoice-edit.component.css']
})
export class InvoiceEditComponent implements OnInit {
  invoiceForm: FormGroup;
  invoice: InvoiceItem | null = null;
  salesOrder: SalesOrder | null = null;
  developer: Developer | null = null;
  isLoading = false;
  errorMessage = '';
  isSaving = false;

  statusOptions = [
    { value: 'Pending', label: 'Pending' },
    { value: 'Paid', label: 'Paid' },
    { value: 'Overdue', label: 'Overdue' }
  ];

  constructor(
    private fb: FormBuilder,
    private salesOrderService: SalesOrderService,
    private developerService: DeveloperService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.invoiceForm = this.fb.group({
      invoiceNumber: ['', Validators.required],
      invoiceSequence: [1, [Validators.required, Validators.min(1)]],
      dueDate: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0)]],
      status: ['Pending', Validators.required],
      description: ['', Validators.required],
      vat: [0, [Validators.required, Validators.min(0)]],
      grandTotal: [0, [Validators.required, Validators.min(0)]],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['invoiceNumber']) {
        this.loadInvoice(params['invoiceNumber']);
      } else {
        this.router.navigate(['/invoices']);
      }
    });
  }

  loadInvoice(invoiceNumber: string): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    // First, get all sales orders to find the one containing this invoice
    this.salesOrderService.getAllSalesOrders().subscribe({
      next: (salesOrders) => {
        const salesOrderWithInvoice = salesOrders.find(so => 
          so.invoices && so.invoices.some(inv => inv.invoiceNumber === invoiceNumber)
        );

        if (salesOrderWithInvoice) {
          this.salesOrder = salesOrderWithInvoice;
          const invoiceData = salesOrderWithInvoice.invoices!.find(inv => inv.invoiceNumber === invoiceNumber);
          
          if (invoiceData) {
            this.invoice = {
              invoiceNumber: invoiceData.invoiceNumber,
              invoiceSequence: invoiceData.invoiceSequence || 1,
              dueDate: new Date(invoiceData.dueDate || new Date()),
              amount: invoiceData.amount || 0,
              status: invoiceData.status || 'Pending',
              description: invoiceData.description || '',
              generatedDate: new Date(invoiceData.generatedDate || new Date()),
              vat: (invoiceData as any).vat || 0,
              grandTotal: (invoiceData as any).grandTotal || 0,
              notes: (invoiceData as any).notes || ''
            };

            this.loadDeveloper(salesOrderWithInvoice.customerId);
            this.populateForm();
          } else {
            this.errorMessage = 'Invoice not found';
          }
        } else {
          this.errorMessage = 'Invoice not found in any sales order';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading invoice:', error);
        this.errorMessage = 'Error loading invoice';
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

  populateForm(): void {
    if (!this.invoice) return;

    this.invoiceForm.patchValue({
      invoiceNumber: this.invoice.invoiceNumber,
      invoiceSequence: this.invoice.invoiceSequence,
      dueDate: this.invoice.dueDate,
      amount: this.invoice.amount,
      status: this.invoice.status,
      description: this.invoice.description,
      vat: this.invoice.vat || 0,
      grandTotal: this.invoice.grandTotal || this.invoice.amount,
      notes: this.invoice.notes || ''
    });
  }

  onSave(): void {
    if (this.invoiceForm.valid && this.invoice && this.salesOrder) {
      this.isSaving = true;
      
      const formValue = this.invoiceForm.value;
      
      // Update the invoice data
      const updatedInvoice = {
        ...this.invoice,
        invoiceSequence: formValue.invoiceSequence,
        dueDate: formValue.dueDate,
        amount: formValue.amount,
        status: formValue.status,
        description: formValue.description,
        vat: formValue.vat,
        grandTotal: formValue.grandTotal,
        notes: formValue.notes
      };

      // Update the invoice in the sales order
      if (this.salesOrder.invoices) {
        const invoiceIndex = this.salesOrder.invoices.findIndex(inv => inv.invoiceNumber === this.invoice!.invoiceNumber);
        if (invoiceIndex !== -1) {
          this.salesOrder.invoices[invoiceIndex] = updatedInvoice;
          
          this.salesOrderService.updateSalesOrder(this.salesOrder._id, this.salesOrder).subscribe({
            next: () => {
              this.snackBar.open('Invoice updated successfully', 'Close', {
                duration: 3000
              });
              this.router.navigate(['/invoices/view', this.invoice!.invoiceNumber]);
            },
            error: (error) => {
              console.error('Error updating invoice:', error);
              this.snackBar.open('Error updating invoice', 'Close', {
                duration: 3000
              });
              this.isSaving = false;
            }
          });
        }
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    if (this.invoiceForm.dirty) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '400px',
        data: {
          title: 'Discard Changes',
          message: 'Are you sure you want to discard your changes?',
          confirmText: 'Discard',
          cancelText: 'Keep Editing'
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.router.navigate(['/invoices/view', this.invoice!.invoiceNumber]);
        }
      });
    } else {
      this.router.navigate(['/invoices/view', this.invoice!.invoiceNumber]);
    }
  }

  onBack(): void {
    this.router.navigate(['/invoices']);
  }

  markFormGroupTouched(): void {
    Object.keys(this.invoiceForm.controls).forEach(key => {
      const control = this.invoiceForm.get(key);
      control?.markAsTouched();
    });
  }

  calculateVat(): void {
    const amount = this.invoiceForm.get('amount')?.value || 0;
    const vat = amount * 0.05; // 5% VAT
    this.invoiceForm.patchValue({ vat: vat });
    this.calculateGrandTotal();
  }

  calculateGrandTotal(): void {
    const amount = this.invoiceForm.get('amount')?.value || 0;
    const vat = this.invoiceForm.get('vat')?.value || 0;
    const grandTotal = amount + vat;
    this.invoiceForm.patchValue({ grandTotal: grandTotal });
  }

  canEdit(): boolean {
    return this.invoice?.status === 'Pending';
  }
} 