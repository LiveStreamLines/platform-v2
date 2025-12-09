import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { SalesOrderService, SalesOrder } from '../../services/sales-order.service';
import { DeveloperService } from '../../services/developer.service';
import { Developer } from '../../models/developer.model';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project.model';
import { DeveloperFormComponent } from '../developers/developer-form/developer-form.component';
import { ProjectFormComponent } from '../projects/project-form/project-form.component';

interface LineItem {
  camera: string;
  cameraName: string;
  duration: number;
  monthlyFee: number;
  value: number;
  vat: number;
}

@Component({
  selector: 'app-sales-order-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sales-order-form.component.html',
  styleUrls: ['./sales-order-form.component.css']
})
export class SalesOrderFormComponent implements OnInit {
  salesOrderForm: FormGroup;
  developers: Developer[] = [];
  availableProjects: Project[] = [];
  selectedDeveloper: Developer | null = null;
  selectedProject: Project | null = null;
  isLoading = false;
  errorMessage = '';
  isEditMode = false;
  currentSalesOrder: SalesOrder | null = null;
  currentOrderNumber: string = '';

  constructor(
    private fb: FormBuilder,
    private salesOrderService: SalesOrderService,
    private developerService: DeveloperService,
    private projectService: ProjectService,
    private router: Router,
    private dialog: MatDialog,
    private activatedRoute: ActivatedRoute
  ) {
    this.salesOrderForm = this.fb.group({
      customerId: ['', Validators.required],
      projectId: [''],
      projectName: [''],
      orderDate: [new Date().toISOString().split('T')[0], Validators.required],
      lineItems: this.fb.array([]),
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadDevelopers();
    this.addLineItem(); // Add initial line item

    // Check if we're in edit mode
    this.activatedRoute.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.loadSalesOrderForEdit(params['id']);
      } else {
        // Generate order number for new sales order
        this.generateOrderNumber();
      }
    });
  }

  get lineItems() {
    return this.salesOrderForm.get('lineItems') as FormArray;
  }

  loadDevelopers(): void {
    console.log('Loading developers...');
    this.isLoading = true;
    this.developerService.getAllDevelopers().subscribe({
      next: (devs) => {
        console.log('Developers loaded successfully:', devs);
        this.developers = devs;
        this.isLoading = false;
        if (devs.length === 0) {
          console.warn('No developers found in the response');
        }
      },
      error: (err) => { 
        console.error('Error loading developers:', err);
        this.developers = []; 
        this.isLoading = false;
        this.errorMessage = 'Error loading developers. Please try again.';
      }
    });
  }

  onDeveloperChange(): void {
    const customerId = this.salesOrderForm.get('customerId')?.value;
    this.selectedDeveloper = this.developers.find(dev => dev._id === customerId) || null;
    this.selectedProject = null;
    this.salesOrderForm.patchValue({
      projectId: '',
      projectName: ''
    });
    
    // Load available projects for this developer
    if (customerId) {
      this.loadAvailableProjects(customerId);
    } else {
      this.availableProjects = [];
    }
  }

  loadAvailableProjects(developerId: string): void {
    this.isLoading = true;
    this.projectService.getAvailableProjectsForSalesOrder(developerId).subscribe({
      next: (projects) => {
        console.log('Available projects loaded:', projects);
        this.availableProjects = projects;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading available projects:', error);
        this.availableProjects = [];
        this.isLoading = false;
      }
    });
  }

  onProjectChange(): void {
    const projectId = this.salesOrderForm.get('projectId')?.value;
    if (projectId) {
      this.selectedProject = this.availableProjects.find(project => project._id === projectId) || null;
      if (this.selectedProject) {
        this.salesOrderForm.patchValue({
          projectName: this.selectedProject.projectName
        });
      }
    } else {
      this.selectedProject = null;
      this.salesOrderForm.patchValue({
        projectName: ''
      });
    }
  }

  addNewDeveloper(): void {
    const dialogRef = this.dialog.open(DeveloperFormComponent, {
      width: '600px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadDevelopers();
        // Auto-select the newly created developer
        this.salesOrderForm.patchValue({
          customerId: result._id
        });
        this.onDeveloperChange();
      }
    });
  }

  addNewProject(): void {
    const customerId = this.salesOrderForm.get('customerId')?.value;
    if (!customerId) {
      alert('Please select a customer first');
      return;
    }

    const dialogRef = this.dialog.open(ProjectFormComponent, {
      width: '600px',
      data: { 
        isEditMode: false,
        developerId: customerId
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success && result.project) {
        // Refresh the available projects list
        this.loadAvailableProjects(customerId);
        
        // Auto-select the newly created project
        this.selectedProject = result.project;
        this.salesOrderForm.patchValue({
          projectId: result.project._id,
          projectName: result.project.projectName
        });
        console.log('Project added and selected:', result.project);
        this.logFormState();
      }
    });
  }

  editProject(): void {
    console.log('editProject called');
    console.log('selectedProject:', this.selectedProject);
    console.log('selectedDeveloper:', this.selectedDeveloper);
    
    if (!this.selectedProject) {
      console.log('No selected project, calling addNewProject');
      this.addNewProject();
      return;
    }

    console.log('Loading full project data for ID:', this.selectedProject._id);
    // Load the full project data first
    this.projectService.getProjectById(this.selectedProject._id).subscribe({
      next: (fullProject) => {
        console.log('Full project data loaded:', fullProject);
        const dialogRef = this.dialog.open(ProjectFormComponent, {
          width: '600px',
          data: { 
            isEditMode: true,
            project: fullProject,
            developerId: this.selectedDeveloper?._id // Pass the developer ID to disable the field
          }
        });

        dialogRef.afterClosed().subscribe(result => {
          console.log('Project dialog closed with result:', result);
          if (result && result.success && result.project) {
            this.selectedProject = result.project;
            this.salesOrderForm.patchValue({
              projectName: result.project.projectName
            });
            console.log('Project updated:', result.project);
            this.logFormState();
          }
        });
      },
      error: (error) => {
        console.error('Error loading project details:', error);
        // Fallback to using the basic project data we have
        console.log('Using fallback project data:', this.selectedProject);
        const dialogRef = this.dialog.open(ProjectFormComponent, {
          width: '600px',
          data: { 
            isEditMode: true,
            project: this.selectedProject,
            developerId: this.selectedDeveloper?._id
          }
        });

        dialogRef.afterClosed().subscribe(result => {
          console.log('Project dialog closed with result (fallback):', result);
          if (result && result.success && result.project) {
            this.selectedProject = result.project;
            this.salesOrderForm.patchValue({
              projectName: result.project.projectName
            });
            console.log('Project updated:', result.project);
            this.logFormState();
          }
        });
      }
    });
  }

  logFormState(): void {
    console.log('Current form values:', this.salesOrderForm.value);
    console.log('Selected project:', this.selectedProject);
    console.log('Project name in form:', this.salesOrderForm.get('projectName')?.value);
    console.log('Project ID in form:', this.salesOrderForm.get('projectId')?.value);
  }

  addLineItem(): void {
    const lineItem = this.fb.group({
      camera: ['', Validators.required],
      cameraName: ['', Validators.required],
      duration: [1, [Validators.required, Validators.min(1)]],
      monthlyFee: [0, [Validators.required, Validators.min(0)]],
      value: [0],
      vat: [0]
    });

    this.lineItems.push(lineItem);
    this.updateLineItemCalculations(this.lineItems.length - 1);
  }

  removeLineItem(index: number): void {
    if (this.lineItems.length > 1) {
      this.lineItems.removeAt(index);
      this.updateTotalCalculations();
    }
  }

  updateLineItemCalculations(index: number): void {
    const lineItem = this.lineItems.at(index);
    const duration = lineItem.get('duration')?.value || 0;
    const monthlyFee = lineItem.get('monthlyFee')?.value || 0;
    const value = duration * monthlyFee;
    const vat = value * 0.05; // 5% VAT

    lineItem.patchValue({
      value: value,
      vat: vat
    });

    this.updateTotalCalculations();
  }

  updateTotalCalculations(): void {
    // This will be handled in the template with getter methods
  }

  calculateTotalValue(): number {
    return this.lineItems.controls.reduce((total, control) => {
      return total + (control.get('value')?.value || 0);
    }, 0);
  }

  calculateTotalVat(): number {
    return this.lineItems.controls.reduce((total, control) => {
      return total + (control.get('vat')?.value || 0);
    }, 0);
  }

  calculateGrandTotal(): number {
    return this.calculateTotalValue() + this.calculateTotalVat();
  }

  onSubmit(): void {
    if (this.salesOrderForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const formValue = this.salesOrderForm.value;
      const salesOrderData: Partial<SalesOrder> = {
        orderNumber: this.isEditMode ? this.currentSalesOrder?.orderNumber : this.currentOrderNumber,
        customerId: formValue.customerId,
        customerName: this.selectedDeveloper?.developerName || '',
        developerTag: this.selectedDeveloper?.developerTag || '',
        projectId: formValue.projectId,
        projectName: formValue.projectName,
        projectTag: this.selectedProject?.projectTag || '',
        orderDate: new Date(formValue.orderDate),
        status: 'Draft',
        cameras: formValue.lineItems.map((item: any) => ({
          cameraId: item.camera,
          cameraName: item.cameraName,
          contractDuration: item.duration,
          monthlyFee: item.monthlyFee,
          status: 'Pending'
        })),
        notes: formValue.notes,
        invoices: []
      };

      console.log('Sending sales order data:', salesOrderData);
      console.log('Form values:', formValue);
      console.log('Selected project:', this.selectedProject);

      if (this.isEditMode && this.currentSalesOrder) {
        // Update existing sales order
        this.salesOrderService.updateSalesOrder(this.currentSalesOrder._id, salesOrderData).subscribe({
          next: (result) => {
            console.log('Sales order updated successfully:', result);
            this.router.navigate(['/sales-orders']);
          },
          error: (error) => {
            console.error('Error updating sales order:', error);
            this.errorMessage = 'Error updating sales order';
            this.isLoading = false;
          }
        });
      } else {
        // Create new sales order
        this.salesOrderService.createSalesOrder(salesOrderData).subscribe({
          next: (result) => {
            console.log('Sales order created successfully:', result);
            this.router.navigate(['/sales-orders']);
          },
          error: (error) => {
            console.error('Error creating sales order:', error);
            this.errorMessage = 'Error creating sales order';
            this.isLoading = false;
          }
        });
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  markFormGroupTouched(): void {
    Object.keys(this.salesOrderForm.controls).forEach(key => {
      const control = this.salesOrderForm.get(key);
      control?.markAsTouched();
    });
  }

  onCancel(): void {
    this.router.navigate(['/sales-orders']);
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

  loadSalesOrderForEdit(id: string): void {
    this.isLoading = true;
    this.salesOrderService.getSalesOrderById(id).subscribe({
      next: (order) => {
        // Check if the order can be edited (only Draft status)
        if (order.status !== 'Draft') {
          this.errorMessage = `Cannot edit sales order with status "${order.status}". Only Draft orders can be edited.`;
          this.isLoading = false;
          // Redirect to view page after a short delay
          setTimeout(() => {
            this.router.navigate(['/sales-orders/view', id]);
          }, 3000);
          return;
        }

        this.currentSalesOrder = order;
        
        // Clear existing line items
        while (this.lineItems.length !== 0) {
          this.lineItems.removeAt(0);
        }
        
        // Populate form with existing data
        this.salesOrderForm.patchValue({
          customerId: order.customerId,
          projectId: order.projectId || '',
          projectName: order.projectName || '',
          orderDate: new Date(order.orderDate).toISOString().split('T')[0],
          notes: order.notes || ''
        });
        
        // Set selected developer
        this.selectedDeveloper = this.developers.find(dev => dev._id === order.customerId) || null;
        
        // Load project if exists
        if (order.projectId && order.projectName) {
          this.selectedProject = {
            _id: order.projectId,
            projectName: order.projectName,
            projectTag: order.projectTag || '',
            description: '',
            developer: order.customerId,
            index: '0',
            isActive: true,
            status: 'new',
            logo: '',
            createdDate: new Date().toISOString()
          };
        }
        
        // Add line items from existing cameras
        if (order.cameras && order.cameras.length > 0) {
          order.cameras.forEach((camera: any) => {
            const lineItem = this.fb.group({
              camera: [camera.cameraId, Validators.required],
              cameraName: [camera.cameraName, Validators.required],
              duration: [camera.contractDuration, [Validators.required, Validators.min(1)]],
              monthlyFee: [camera.monthlyFee, [Validators.required, Validators.min(0)]],
              value: [camera.contractDuration * camera.monthlyFee],
              vat: [camera.contractDuration * camera.monthlyFee * 0.05]
            });
            this.lineItems.push(lineItem);
          });
        } else {
          // Add at least one empty line item
          this.addLineItem();
        }
        
        this.isLoading = false;
        console.log('Sales order loaded for edit:', order);
      },
      error: (err) => {
        console.error('Error loading sales order:', err);
        this.errorMessage = 'Error loading sales order';
        this.isLoading = false;
      }
    });
  }

  generateOrderNumber(): void {
    this.salesOrderService.generateNextOrderNumber().subscribe({
      next: (orderNumber) => {
        this.currentOrderNumber = orderNumber;
      },
      error: (error) => {
        console.error('Error generating order number:', error);
        // Fallback: generate a basic order number
        const currentYear = new Date().getFullYear();
        const timestamp = Date.now().toString().slice(-4);
        this.currentOrderNumber = `SO-${currentYear}-${timestamp}`;
      }
    });
  }
} 