import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environments';
import { AuthService } from './auth.service';
import { map } from 'rxjs/operators';

export interface SalesOrder {
    _id: string;
    orderNumber: string;
    customerId: string;
    customerName: string;
    developerTag?: string;
    projectId?: string;
    projectName?: string;
    projectTag?: string;
    orderDate: Date;
    status: 'Draft' | 'Confirmed' | 'Invoiced' | 'Partially Invoiced' | 'Fully Invoiced';
    cameras: {
        cameraId: string;
        cameraName: string;
        contractDuration: number;
        monthlyFee: number;
        status: 'Pending' | 'Installed' | 'Active' | 'Removed';
        invoicedDuration?: number;
        installedDate?: string | null;
    }[];
    invoices: {
        invoiceNumber: string;
        invoiceSequence: number;
        dueDate: Date;
        amount: number;
        status: 'Pending' | 'Paid' | 'Overdue';
        description: string;
        generatedDate: Date;
    }[];
    billingAddress: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    contactPerson: {
        name: string;
        email: string;
        phone: string;
    };
    notes: string;
    createdAt: Date;
    updatedAt: Date;
}

@Injectable({
    providedIn: 'root'
})
export class SalesOrderService {
    private apiUrl = environment.backend + '/api/sales-orders';

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) {}

    private getHeaders(): HttpHeaders {
        const authToken = this.authService.getAuthToken();
        return new HttpHeaders({
            'Authorization': authToken ? `Bearer ${authToken}` : ''
        });
    }

    getAllSalesOrders(): Observable<SalesOrder[]> {
        return this.http.get<SalesOrder[]>(this.apiUrl, { headers: this.getHeaders() });
    }

    getSalesOrderById(id: string): Observable<SalesOrder> {
        return this.http.get<SalesOrder>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
    }

    createSalesOrder(salesOrder: Partial<SalesOrder>): Observable<SalesOrder> {
        return this.http.post<SalesOrder>(this.apiUrl, salesOrder, { headers: this.getHeaders() });
    }

    updateSalesOrder(id: string, salesOrder: Partial<SalesOrder>): Observable<SalesOrder> {
        return this.http.put<SalesOrder>(`${this.apiUrl}/${id}`, salesOrder, { headers: this.getHeaders() });
    }

    deleteSalesOrder(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
    }

    getSalesOrdersByCustomer(customerId: string): Observable<SalesOrder[]> {
        return this.http.get<SalesOrder[]>(`${this.apiUrl}/customer/${customerId}`, { headers: this.getHeaders() });
    }

    generateNextOrderNumber(): Observable<string> {
        return this.http.get<{ nextNumber: string }>(`${this.apiUrl}/next-number`, { headers: this.getHeaders() })
            .pipe(
                map(response => response.nextNumber)
            );
    }

    generateNextInvoiceNumber(): Observable<string> {
        return this.http.get<{ nextNumber: string }>(`${this.apiUrl}/next-invoice-number`, { headers: this.getHeaders() })
            .pipe(
                map(response => response.nextNumber)
            );
    }

    generateInvoiceNumber(salesOrderId: string, invoiceSequence: number): string {
        const currentYear = new Date().getFullYear();
        return `INV-${currentYear}-${invoiceSequence.toString().padStart(4, '0')}`;
    }
} 