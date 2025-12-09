import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { SalesOrderService, SalesOrder } from '../../../services/sales-order.service';
import { DeveloperService } from '../../../services/developer.service';
import { Developer } from '../../../models/developer.model';
import { ProjectService } from '../../../services/project.service';
import { Project } from '../../../models/project.model';
import { Camera } from '../../../models/camera.model';
import { CameraService } from '../../../services/camera.service';
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

interface InvoiceLineItem {
  cameraId: string;
  cameraName: string;
  duration: number;
  amount: number;
  monthlyFee: number;
}

@Component({
  selector: 'app-invoice-detail',
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
    MatTableModule,
    MatSnackBarModule,
    MatTabsModule,
    RouterModule
  ],
  templateUrl: './invoice-detail.component.html',
  styleUrls: ['./invoice-detail.component.css']
})
export class InvoiceDetailComponent implements OnInit {
  invoice: InvoiceItem | null = null;
  salesOrder: SalesOrder | null = null;
  developer: Developer | null = null;
  project: Project | null = null;
  lineItems: InvoiceLineItem[] = [];
  isLoading = false;
  errorMessage = '';
  cameraDetailsMap: { [cameraId: string]: Camera | undefined } = {};

  // Table columns for line items
  lineItemColumns: string[] = ['cameraName', 'duration', 'monthlyFee', 'amount'];

  constructor(
    private fb: FormBuilder,
    private salesOrderService: SalesOrderService,
    private developerService: DeveloperService,
    private projectService: ProjectService,
    private cameraService: CameraService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

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

            // Load related data
            this.loadDeveloper(salesOrderWithInvoice.customerId);
            if (salesOrderWithInvoice.projectId) {
              this.loadProject(salesOrderWithInvoice.projectId);
            }
            this.loadCameraDetails();
            this.initializeLineItems();
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

  loadProject(projectId: string): void {
    this.projectService.getProjectById(projectId).subscribe({
      next: (project) => {
        this.project = project;
      },
      error: (error) => {
        console.error('Error loading project:', error);
      }
    });
  }

  loadCameraDetails(): void {
    if (this.salesOrder && this.salesOrder.cameras && this.salesOrder.cameras.length > 0) {
      const cameraIds = this.salesOrder.cameras.map(c => c.cameraId);
      this.cameraService.getAllCameras().subscribe(allCameras => {
        this.cameraDetailsMap = {};
        for (const cam of allCameras) {
          if (cameraIds.includes(cam._id)) {
            this.cameraDetailsMap[cam._id] = cam;
          }
        }
      });
    }
  }

  initializeLineItems(): void {
    if (!this.salesOrder || !this.invoice) return;

    // This would need to be adjusted based on how line items are stored in your invoice data
    // For now, we'll create line items from the sales order cameras
    this.lineItems = this.salesOrder.cameras.map(camera => {
      const cameraDetails = this.cameraDetailsMap[camera.cameraId];
      return {
        cameraId: camera.cameraId,
        cameraName: cameraDetails?.camera || camera.cameraName || 'Unknown Camera',
        duration: camera.contractDuration || 0,
        amount: camera.monthlyFee || 0,
        monthlyFee: camera.monthlyFee || 0
      };
    });
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

  getStatusColor(status: string): string {
    switch (status) {
      case 'Paid':
        return 'green';
      case 'Overdue':
        return 'red';
      case 'Pending':
      default:
        return 'orange';
    }
  }

  isOverdue(): boolean {
    if (!this.invoice) return false;
    return this.invoice.status === 'Overdue' || 
           (this.invoice.status === 'Pending' && new Date() > this.invoice.dueDate);
  }

  onBack(): void {
    this.router.navigate(['/invoices']);
  }

  onEdit(): void {
    if (this.invoice) {
      this.router.navigate(['/invoices/edit', this.invoice.invoiceNumber]);
    }
  }

  onPrint(): void {
    window.print();
  }

  onMarkAsPaid(): void {
    if (!this.invoice) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Mark Invoice as Paid',
        message: `Are you sure you want to mark invoice ${this.invoice.invoiceNumber} as paid?`,
        confirmText: 'Mark as Paid',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.markInvoiceAsPaid();
      }
    });
  }

  private markInvoiceAsPaid(): void {
    if (!this.invoice || !this.salesOrder) return;

    this.isLoading = true;
    
    // Update the invoice status in the sales order
    if (this.salesOrder.invoices) {
      const invoiceIndex = this.salesOrder.invoices.findIndex(inv => inv.invoiceNumber === this.invoice!.invoiceNumber);
      if (invoiceIndex !== -1) {
        this.salesOrder.invoices[invoiceIndex].status = 'Paid';
        
        this.salesOrderService.updateSalesOrder(this.salesOrder._id, this.salesOrder).subscribe({
          next: () => {
            this.invoice!.status = 'Paid';
            this.snackBar.open('Invoice marked as paid successfully', 'Close', {
              duration: 3000
            });
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error updating invoice status:', error);
            this.snackBar.open('Error updating invoice status', 'Close', {
              duration: 3000
            });
            this.isLoading = false;
          }
        });
      }
    }
  }

  canEdit(): boolean {
    return this.invoice?.status === 'Pending';
  }

  canMarkAsPaid(): boolean {
    return this.invoice?.status === 'Pending';
  }

  getTotalAmount(): number {
    return this.lineItems.reduce((total, item) => total + item.amount, 0);
  }

  getVatAmount(): number {
    return this.invoice?.vat || 0;
  }

  getGrandTotal(): number {
    return this.invoice?.grandTotal || this.getTotalAmount();
  }
} 