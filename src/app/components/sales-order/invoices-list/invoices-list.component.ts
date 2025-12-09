import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { SalesOrderService, SalesOrder } from '../../../services/sales-order.service';

interface InvoiceLineItem {
  _id: string;
  description: string;
  amount: number;
  salesOrderId: string;
  orderNumber: string;
  customerName: string;
  customerId: string;
}

interface InvoiceDisplay {
  invoiceNumber: string;
  invoiceSequence: number;
  dueDate: Date;
  totalAmount: number;
  status: 'Pending' | 'Paid' | 'Overdue';
  generatedDate: Date;
  lineItems: InvoiceLineItem[];
  customerName: string;
  customerId: string;
}

@Component({
  selector: 'app-invoices-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatExpansionModule,
    MatTooltipModule,
    FormsModule
  ],
  templateUrl: './invoices-list.component.html',
  styleUrls: ['./invoices-list.component.css']
})
export class InvoicesListComponent implements OnInit {
  allInvoices: InvoiceDisplay[] = [];
  filteredInvoices: InvoiceDisplay[] = [];
  uniqueCustomers: { id: string; name: string }[] = [];
  isLoading = false;
  errorMessage = '';

  // Filter properties
  searchTerm = '';
  statusFilter = '';
  customerFilter = '';

  // Table columns for line items
  lineItemColumns: string[] = ['description', 'orderNumber', 'amount'];

  constructor(
    private salesOrderService: SalesOrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('InvoicesListComponent initialized');
    // Initialize with empty arrays to prevent undefined errors
    this.allInvoices = [];
    this.filteredInvoices = [];
    this.uniqueCustomers = [];
    this.loadAllInvoices();
  }

  loadAllInvoices(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.salesOrderService.getAllSalesOrders().subscribe({
      next: (salesOrders) => {
        this.allInvoices = this.extractInvoicesFromSalesOrders(salesOrders);
        
        this.uniqueCustomers = this.calculateUniqueCustomers();
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading invoices:', error);
        this.errorMessage = 'Error loading invoices';
        this.isLoading = false;
      }
    });
  }

  extractInvoicesFromSalesOrders(salesOrders: SalesOrder[]): InvoiceDisplay[] {
    const invoiceGroups: { [key: string]: InvoiceDisplay } = {};

    if (!salesOrders || !Array.isArray(salesOrders)) {
      return [];
    }

    salesOrders.forEach((salesOrder, index) => {
      if (salesOrder && salesOrder.invoices && Array.isArray(salesOrder.invoices) && salesOrder.invoices.length > 0) {
        salesOrder.invoices.forEach((invoice, invoiceIndex) => {
          if (invoice && invoice.invoiceNumber) {
            try {
              const invoiceKey = invoice.invoiceNumber;
              
              if (!invoiceGroups[invoiceKey]) {
                // Create new invoice group
                invoiceGroups[invoiceKey] = {
                  invoiceNumber: invoice.invoiceNumber,
                  invoiceSequence: invoice.invoiceSequence || 1,
                  dueDate: new Date(invoice.dueDate || new Date()),
                  totalAmount: 0,
                  status: invoice.status || 'Pending',
                  generatedDate: new Date(invoice.generatedDate || new Date()),
                  customerName: salesOrder.customerName || '',
                  customerId: salesOrder.customerId || '',
                  lineItems: []
                };
              }

              // Add line item to the invoice
              const lineItem: InvoiceLineItem = {
                _id: `${invoiceKey}-${salesOrder._id}-${invoiceIndex}`,
                description: invoice.description || `Invoice from ${salesOrder.orderNumber}`,
                amount: invoice.amount || 0,
                salesOrderId: salesOrder._id || '',
                orderNumber: salesOrder.orderNumber || '',
                customerName: salesOrder.customerName || '',
                customerId: salesOrder.customerId || ''
              };

              invoiceGroups[invoiceKey].lineItems.push(lineItem);
              invoiceGroups[invoiceKey].totalAmount += lineItem.amount;

            } catch (error) {
              console.error('Error processing invoice:', error, invoice);
            }
          }
        });
      }
    });

    // Convert groups to array and sort by generated date (newest first)
    const sortedInvoices = Object.values(invoiceGroups).sort((a, b) => b.generatedDate.getTime() - a.generatedDate.getTime());
    return sortedInvoices;
  }

  calculateUniqueCustomers(): { id: string; name: string }[] {
    const customers = this.allInvoices.map(invoice => ({
      id: invoice.customerId,
      name: invoice.customerName
    }));

    // Remove duplicates
    return customers.filter((customer, index, self) => 
      index === self.findIndex(c => c.id === customer.id)
    ).sort((a, b) => a.name.localeCompare(b.name));
  }

  applyFilters(): void {
    if (!this.allInvoices) {
      this.filteredInvoices = [];
      return;
    }

    this.filteredInvoices = this.allInvoices.filter(invoice => {
      if (!invoice) return false;

      const matchesSearch = !this.searchTerm || 
        (invoice.invoiceNumber && invoice.invoiceNumber.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (invoice.customerName && invoice.customerName.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        invoice.lineItems.some(item => 
          (item.description && item.description.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
          (item.orderNumber && item.orderNumber.toLowerCase().includes(this.searchTerm.toLowerCase()))
        );

      const matchesStatus = !this.statusFilter || invoice.status === this.statusFilter;
      const matchesCustomer = !this.customerFilter || invoice.customerId === this.customerFilter;

      return matchesSearch && matchesStatus && matchesCustomer;
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  onCustomerFilterChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = '';
    this.customerFilter = '';
    this.applyFilters();
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Pending': return '#ff9800';
      case 'Paid': return '#4caf50';
      case 'Overdue': return '#f44336';
      default: return '#757575';
    }
  }

  getUniqueCustomers(): { id: string; name: string }[] {
    return this.uniqueCustomers;
  }

  viewSalesOrder(salesOrderId: string): void {
    // Navigate to sales order view
    window.open(`/sales-orders/view/${salesOrderId}`, '_blank');
  }

  viewInvoice(invoiceNumber: string): void {
    this.router.navigate(['/invoices/view', invoiceNumber]);
  }

  getTotalInvoicedAmount(): number {
    return this.filteredInvoices.reduce((total, invoice) => total + invoice.totalAmount, 0);
  }

  getTotalPaidAmount(): number {
    return this.filteredInvoices
      .filter(invoice => invoice.status === 'Paid')
      .reduce((total, invoice) => total + invoice.totalAmount, 0);
  }

  getTotalPendingAmount(): number {
    return this.filteredInvoices
      .filter(invoice => invoice.status === 'Pending')
      .reduce((total, invoice) => total + invoice.totalAmount, 0);
  }

  getTotalOverdueAmount(): number {
    return this.filteredInvoices
      .filter(invoice => invoice.status === 'Overdue')
      .reduce((total, invoice) => total + invoice.totalAmount, 0);
  }

  isOverdue(invoice: InvoiceDisplay): boolean {
    return invoice.dueDate < new Date() && invoice.status !== 'Paid';
  }

  getPaidInvoicesCount(): number {
    return this.filteredInvoices.filter(invoice => invoice.status === 'Paid').length;
  }

  getPendingInvoicesCount(): number {
    return this.filteredInvoices.filter(invoice => invoice.status === 'Pending').length;
  }

  getOverdueInvoicesCount(): number {
    return this.filteredInvoices.filter(invoice => invoice.status === 'Overdue').length;
  }
} 