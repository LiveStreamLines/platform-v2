import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';

import { SalesOrderService, SalesOrder } from '../../../services/sales-order.service';
import { DeveloperService } from '../../../services/developer.service';
import { Developer } from '../../../models/developer.model';

@Component({
    selector: 'app-sales-order-list',
    standalone: true,
    imports: [
        CommonModule, 
        RouterModule, 
        FormsModule, 
        ReactiveFormsModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatChipsModule,
        MatProgressSpinnerModule,
        MatDialogModule,
        MatSelectModule,
        MatFormFieldModule,
        MatInputModule,
        MatPaginatorModule,
        MatSortModule,
        MatTooltipModule
    ],
    templateUrl: './sales-order-list.component.html',
    styleUrls: ['./sales-order-list.component.css']
})
export class SalesOrderListComponent implements OnInit, AfterViewInit {
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;
    dataSource: MatTableDataSource<SalesOrder>;

    // Filter properties
    selectedCustomerId: string | null = null;
    selectedStatus: string | null = null;
    orderNumberSearch: string = '';
    projectNameSearch: string = '';

    // Data arrays
    salesOrders: SalesOrder[] = [];
    developers: Developer[] = [];
    filteredOrders: SalesOrder[] = [];

    // Loading state
    isLoading = false;

    // Table columns
    displayedColumns: string[] = [
        'orderNumber',
        'customerName',
        'projectName',
        'orderDate',
        'totalValue',
        'status',
        'invoiceProgress',
        'actions'
    ];

    // Status options for filter
    statusOptions = [
        { value: null, viewValue: 'All Statuses' },
        { value: 'Draft', viewValue: 'Draft' },
        { value: 'Confirmed', viewValue: 'Confirmed' },
        { value: 'Partially Invoiced', viewValue: 'Partially Invoiced' },
        { value: 'Fully Invoiced', viewValue: 'Fully Invoiced' }
    ];

    constructor(
        private salesOrderService: SalesOrderService,
        private developerService: DeveloperService,
        private router: Router,
        public dialog: MatDialog
    ) {
        this.dataSource = new MatTableDataSource<SalesOrder>([]);
        this.dataSource.sortingDataAccessor = (item: SalesOrder, property: string) => {
            switch(property) {
                case 'orderNumber': return item.orderNumber;
                case 'customerName': return item.customerName;
                case 'projectName': return item.projectName || '';
                case 'orderDate': return new Date(item.orderDate).getTime();
                case 'totalValue': return this.calculateTotalContractValue(item);
                case 'status': return this.getDisplayStatus(item);
                case 'invoiceProgress': return this.getInvoiceProgress(item).percentage;
                default: return (item as any)[property];
            }
        };
    }

    ngOnInit(): void {
        this.loadSalesOrders();
        this.loadDevelopers();
    }

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    loadSalesOrders(): void {
        this.isLoading = true;
        this.salesOrderService.getAllSalesOrders().subscribe({
            next: (orders) => {
                this.salesOrders = orders;
                this.filteredOrders = orders;
                this.dataSource.data = orders;
                console.log('Sales orders loaded successfully:', orders);
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading sales orders:', error);
                this.isLoading = false;
                
                let errorMessage = 'Error loading sales orders';
                
                if (error.status === 401) {
                    errorMessage = 'Authentication required. Please log in again.';
                } else if (error.status === 403) {
                    errorMessage = 'Access denied. You may not have permission to view sales orders.';
                } else if (error.status === 404) {
                    errorMessage = 'Sales orders API endpoint not found. Please check backend configuration.';
                } else if (error.status === 0 || error.status === 500) {
                    errorMessage = 'Server error. Please check if the backend server is running.';
                } else if (error.message) {
                    errorMessage = `Error: ${error.message}`;
                }
                
                console.error('Detailed error:', error);
                alert(errorMessage);
            }
        });
    }

    loadDevelopers(): void {
        this.developerService.getAllDevelopers().subscribe({
            next: (developers) => {
                this.developers = developers;
            },
            error: (error) => {
                console.error('Error loading developers:', error);
            }
        });
    }

    // Filter methods
    filterOrders(): void {
        this.filteredOrders = this.salesOrders.filter(order => {
            // Customer filter
            if (this.selectedCustomerId && order.customerId !== this.selectedCustomerId) {
                return false;
            }

            // Status filter
            if (this.selectedStatus && this.getDisplayStatus(order) !== this.selectedStatus) {
                return false;
            }

            // Order number search
            if (this.orderNumberSearch && !order.orderNumber.toLowerCase().includes(this.orderNumberSearch.toLowerCase())) {
                return false;
            }

            // Project name search
            if (this.projectNameSearch && (!order.projectName || !order.projectName.toLowerCase().includes(this.projectNameSearch.toLowerCase()))) {
                return false;
            }

            return true;
        });

        this.dataSource.data = this.filteredOrders;
    }

    onCustomerChange(): void {
        this.filterOrders();
    }

    onStatusChange(): void {
        this.filterOrders();
    }

    onOrderNumberSearch(): void {
        this.filterOrders();
    }

    onProjectNameSearch(): void {
        this.filterOrders();
    }

    // Navigation methods
    createNewOrder(): void {
        this.router.navigate(['/sales-orders/new']);
    }

    editOrder(id: string): void {
        this.router.navigate(['/sales-orders/edit', id]);
    }

    viewOrder(id: string): void {
        this.router.navigate(['/sales-orders/view', id]);
    }

    deleteOrder(id: string): void {
        if (confirm('Are you sure you want to delete this sales order?')) {
            this.salesOrderService.deleteSalesOrder(id).subscribe({
                next: () => {
                    alert('Sales order deleted successfully');
                    this.loadSalesOrders();
                },
                error: (error) => {
                    console.error('Error deleting sales order:', error);
                    alert('Error deleting sales order');
                }
            });
        }
    }

    // Utility methods
    getStatusColor(status: string): 'primary' | 'accent' | 'warn' | 'default' {
        switch (status) {
            case 'Draft':
                return 'accent';
            case 'Confirmed':
                return 'primary';
            case 'Invoiced':
                return 'primary';
            case 'Partially Invoiced':
                return 'accent';
            case 'Fully Invoiced':
                return 'primary';
            case 'Active':
                return 'primary';
            case 'Completed':
                return 'primary';
            case 'Cancelled':
                return 'warn';
            default:
                return 'default';
        }
    }

    formatCurrency(value: number): string {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'AED'
        }).format(value);
    }

    formatDate(date: Date): string {
        return new Date(date).toLocaleDateString();
    }

    calculateTotalContractValue(order: SalesOrder): number {
        if (!order.cameras || order.cameras.length === 0) return 0;
        
        return order.cameras.reduce((total, camera) => {
            return total + (camera.monthlyFee * camera.contractDuration);
        }, 0);
    }

    getInvoiceProgress(order: SalesOrder): { invoiced: number; total: number; percentage: number } {
        const totalContractValue = this.calculateTotalContractValue(order);
        
        if (!order.invoices || order.invoices.length === 0) {
            return {
                invoiced: 0,
                total: totalContractValue,
                percentage: 0
            };
        }

        const totalInvoicedAmount = order.invoices.reduce((total, invoice) => {
            return total + invoice.amount;
        }, 0);

        const percentage = totalContractValue > 0 ? (totalInvoicedAmount / totalContractValue) * 100 : 0;
        
        return {
            invoiced: totalInvoicedAmount,
            total: totalContractValue,
            percentage: Math.round(percentage)
        };
    }

    isFullyInvoiced(order: SalesOrder): boolean {
        if (!order.cameras || order.cameras.length === 0) {
            return false;
        }

        return order.cameras.every(camera => {
            const invoicedDuration = camera.invoicedDuration || 0;
            return invoicedDuration >= camera.contractDuration;
        });
    }

    isPartiallyInvoiced(order: SalesOrder): boolean {
        if (!order.cameras || order.cameras.length === 0) {
            return false;
        }

        const hasInvoicedCameras = order.cameras.some(camera => {
            const invoicedDuration = camera.invoicedDuration || 0;
            return invoicedDuration > 0;
        });

        const allFullyInvoiced = this.isFullyInvoiced(order);

        return hasInvoicedCameras && !allFullyInvoiced;
    }

    getDisplayStatus(order: SalesOrder): string {
        if (this.isFullyInvoiced(order)) {
            return 'Fully Invoiced';
        }
        if (this.isPartiallyInvoiced(order)) {
            return 'Partially Invoiced';
        }
        return order.status;
    }

    canEdit(order: SalesOrder): boolean {
        // Only allow editing if status is Draft or Confirmed
        return order.status === 'Draft' || order.status === 'Confirmed';
    }
} 