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
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SalesOrderService, SalesOrder } from '../../services/sales-order.service';
import { DeveloperService } from '../../services/developer.service';
import { Developer } from '../../models/developer.model';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project.model';
import { InvoiceGenerationDialogComponent } from './invoice-generation-dialog/invoice-generation-dialog.component';
import { Camera } from '../../models/camera.model';
import { CameraService } from '../../services/camera.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

interface InvoiceItem {
  invoiceNumber: string;
  invoiceSequence: number;
  dueDate: Date;
  amount: number;
  status: 'Pending' | 'Paid' | 'Overdue';
  description: string;
  generatedDate: Date;
}

interface PaymentScheduleItem {
  paymentNumber: number;
  dueDate: string;
  amount: number;
  status: 'Pending' | 'Paid' | 'Overdue';
  description: string;
}

@Component({
  selector: 'app-sales-order-view',
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
    MatSnackBarModule
  ],
  templateUrl: './sales-order-view.component.html',
  styleUrls: ['./sales-order-view.component.css']
})
export class SalesOrderViewComponent implements OnInit {
  salesOrder: SalesOrder | null = null;
  invoices: InvoiceItem[] = [];
  developers: Developer[] = [];
  selectedProject: Project | null = null;
  isLoading = false;
  errorMessage = '';
  showInvoices = false;
  installationForm: FormGroup;
  cameraDetailsMap: { [cameraId: string]: Camera | undefined } = {};

  // Table columns for invoices
  invoiceColumns: string[] = ['invoiceNumber', 'invoiceSequence', 'dueDate', 'amount', 'status', 'generatedDate'];

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
  ) {
    this.installationForm = this.fb.group({
      installationDate: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadDevelopers();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.loadSalesOrder(params['id']);
      } else {
        this.router.navigate(['/sales-orders']);
      }
    });
  }

  loadSalesOrder(id: string): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.salesOrderService.getSalesOrderById(id).subscribe({
      next: (salesOrder) => {
        this.salesOrder = salesOrder;

        // Load project details if project exists
        if (salesOrder.projectId) {
          this.loadProjectDetails(salesOrder.projectId);
        }

        // Load invoices if they exist
        if (salesOrder.invoices) {
          this.invoices = salesOrder.invoices.map(invoice => ({
            invoiceNumber: invoice.invoiceNumber,
            invoiceSequence: invoice.invoiceSequence,
            dueDate: new Date(invoice.dueDate),
            amount: invoice.amount,
            status: invoice.status,
            description: invoice.description,
            generatedDate: new Date(invoice.generatedDate)
          }));
          this.showInvoices = this.invoices.length > 0;
        }

        // Fetch camera details from the camera model
        if (salesOrder.cameras && salesOrder.cameras.length > 0) {
          const cameraIds = salesOrder.cameras.map(c => c.cameraId);
          this.cameraService.getAllCameras().subscribe(allCameras => {
            this.cameraDetailsMap = {};
            for (const cam of allCameras) {
              if (cameraIds.includes(cam._id)) {
                this.cameraDetailsMap[cam._id] = cam;
              }
            }
          });
        }

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading sales order:', error);
        this.errorMessage = 'Error loading sales order';
        this.isLoading = false;
      }
    });
  }

  loadProjectDetails(projectId: string): void {
    this.projectService.getProjectById(projectId).subscribe({
      next: (project) => {
        this.selectedProject = project;
      },
      error: (error) => {
        console.error('Error loading project details:', error);
      }
    });
  }

  loadDevelopers(): void {
    this.developerService.getAllDevelopers().subscribe({
      next: (devs) => this.developers = devs,
      error: (err) => { 
        console.error('Error loading developers:', err);
        this.developers = []; 
      }
    });
  }

  getSelectedDeveloper(): Developer | null {
    if (!this.salesOrder) return null;
    
    return this.developers.find(dev => dev._id === this.salesOrder!.customerId) || null;
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

  calculateTotalContractValue(): number {
    if (!this.salesOrder || !this.salesOrder.cameras) return 0;
    
    return this.salesOrder.cameras.reduce((total, camera) => {
      return total + (camera.monthlyFee * camera.contractDuration);
    }, 0);
  }

  calculateTotalVat(): number {
    return this.calculateTotalContractValue() * 0.05; // 5% VAT
  }

  calculateGrandTotal(): number {
    return this.calculateTotalContractValue() + this.calculateTotalVat();
  }

  calculateTotalRemainingAmount(): number {
    if (!this.salesOrder?.invoices || this.salesOrder.invoices.length === 0) {
      return this.calculateTotalContractValue();
    }

    const totalInvoicedAmount = this.salesOrder.invoices.reduce((total, invoice) => {
      return total + invoice.amount;
    }, 0);

    return this.calculateTotalContractValue() - totalInvoicedAmount;
  }

  calculateTotalInvoicedAmount(): number {
    if (!this.salesOrder?.invoices || this.salesOrder.invoices.length === 0) {
      return 0;
    }

    return this.salesOrder.invoices.reduce((total, invoice) => {
      return total + invoice.amount;
    }, 0);
  }

  isFullyInvoiced(): boolean {
    return this.calculateTotalRemainingAmount() <= 0;
  }

  isPartiallyInvoiced(): boolean {
    if (!this.salesOrder?.cameras || this.salesOrder.cameras.length === 0) {
      return false;
    }

    // Check if at least one camera has been invoiced but not all are fully invoiced
    const hasInvoicedCameras = this.salesOrder.cameras.some(camera => {
      const invoicedDuration = camera.invoicedDuration || 0;
      return invoicedDuration > 0;
    });

    const allFullyInvoiced = this.isFullyInvoiced();

    return hasInvoicedCameras && !allFullyInvoiced;
  }

  getInvoiceProgress(): { invoiced: number; total: number; percentage: number } {
    const totalContractValue = this.calculateTotalContractValue();
    const invoicedAmount = this.calculateTotalInvoicedAmount();
    const percentage = totalContractValue > 0 ? (invoicedAmount / totalContractValue) * 100 : 0;
    
    return {
      invoiced: invoicedAmount,
      total: totalContractValue,
      percentage: Math.round(percentage)
    };
  }

  onBack(): void {
    this.router.navigate(['/sales-orders']);
  }

  onEdit(): void {
    if (this.salesOrder) {
      this.router.navigate(['/sales-orders/edit', this.salesOrder._id]);
    }
  }

  openInvoiceGeneration(): void {
    const developer = this.getSelectedDeveloper();
    if (!this.salesOrder || !developer) {
      this.snackBar.open('Sales order or developer information not available', 'Close', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(InvoiceGenerationDialogComponent, {
      width: '1000px',
      maxWidth: '90vw',
      data: {
        salesOrder: this.salesOrder,
        developer: developer
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        this.snackBar.open('Invoice generated successfully', 'Close', { duration: 3000 });
        this.loadSalesOrder(this.salesOrder!._id);
      }
    });
  }

  canEdit(): boolean {
    // Only allow editing if status is Draft
    return this.salesOrder?.status === 'Draft';
  }

  canConfirm(): boolean {
    // Only allow confirming if status is Draft
    return this.salesOrder?.status === 'Draft';
  }

  canInvoice(): boolean {
    // Only allow invoicing if status is Confirmed, Partially Invoiced, or Fully Invoiced
    // and not fully invoiced yet
    return (this.salesOrder?.status === 'Confirmed' || 
            this.salesOrder?.status === 'Partially Invoiced' || 
            this.salesOrder?.status === 'Fully Invoiced') && 
           !this.isFullyInvoiced();
  }

  onConfirm(): void {
    if (!this.salesOrder) return;

    // Show confirmation dialog
    const confirmDialog = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Sales Order',
        message: 'Are you sure you want to confirm this sales order? Once confirmed, the cameras will be saved to the camera list and the order cannot be edited.',
        confirmText: 'Confirm',
        cancelText: 'Cancel'
      }
    });

    confirmDialog.afterClosed().subscribe(result => {
      if (result) {
        this.confirmSalesOrder();
      }
    });
  }

  private confirmSalesOrder(): void {
    if (!this.salesOrder) return;

    this.isLoading = true;
    
    // Update sales order status to Confirmed
    const updatedSalesOrder = {
      ...this.salesOrder,
      status: 'Confirmed' as const
    };

    this.salesOrderService.updateSalesOrder(this.salesOrder._id, updatedSalesOrder).subscribe({
      next: (result) => {
        this.salesOrder = result;
        this.snackBar.open('Sales order confirmed successfully. Cameras have been saved to the camera list.', 'Close', { duration: 5000 });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error confirming sales order:', error);
        this.snackBar.open('Error confirming sales order', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  getDisplayStatus(): string {
    if (this.isFullyInvoiced()) {
      return 'Fully Invoiced';
    }
    if (this.isPartiallyInvoiced()) {
      return 'Partially Invoiced';
    }
    return this.salesOrder?.status || '';
  }
} 