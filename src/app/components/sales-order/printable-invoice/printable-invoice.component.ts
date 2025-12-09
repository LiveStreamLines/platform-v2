import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SalesOrderService, SalesOrder } from '../../../services/sales-order.service';
import { DeveloperService } from '../../../services/developer.service';
import { Developer } from '../../../models/developer.model';
import { ProjectService } from '../../../services/project.service';
import { Project } from '../../../models/project.model';
import { AmountToWordsPipe } from '../../../pipes/amount-to-words.pipe';

@Component({
  selector: 'app-printable-invoice',
  standalone: true,
  imports: [CommonModule, AmountToWordsPipe],
  templateUrl: './printable-invoice.component.html',
  styleUrls: ['./printable-invoice.component.scss']
})
export class PrintableInvoiceComponent implements OnInit {
  invoice: any = null;
  salesOrder: SalesOrder | null = null;
  developer: Developer | null = null;
  project: Project | null = null;
  isLoading = false;
  errorMessage = '';

  constructor(
    private salesOrderService: SalesOrderService,
    private developerService: DeveloperService,
    private projectService: ProjectService,
    private route: ActivatedRoute,
    private router: Router
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
              ...invoiceData,
              dueDate: new Date(invoiceData.dueDate || new Date()),
              generatedDate: new Date(invoiceData.generatedDate || new Date()),
              vat: (invoiceData as any).vat || 0,
              grandTotal: (invoiceData as any).grandTotal || 0,
              notes: (invoiceData as any).notes || ''
            };
            this.loadDeveloper(salesOrderWithInvoice.customerId);
            if (salesOrderWithInvoice.projectId) {
              this.loadProject(salesOrderWithInvoice.projectId);
            }
          } else {
            this.errorMessage = 'Invoice not found';
          }
        } else {
          this.errorMessage = 'Invoice not found in any sales order';
        }
        this.isLoading = false;
      },
      error: (error) => {
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
      error: () => {}
    });
  }

  loadProject(projectId: string): void {
    this.projectService.getProjectById(projectId).subscribe({
      next: (project) => {
        this.project = project;
      },
      error: () => {}
    });
  }

  printInvoice(): void {
    window.print();
  }
} 