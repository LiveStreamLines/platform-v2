// import { Observable } from 'rxjs';

// export class InvoiceGenerationDialogComponent {
//   generateManualInvoice(): Observable<InvoiceData[]> {
//     const selectedItems = this.lineItems.filter(item => item.include && item.amount > 0);
//     if (selectedItems.length === 0) {
//       return new Observable(observer => observer.next([]));
//     }

//     return new Observable(observer => {
//       const newInvoices: InvoiceData[] = [];
//       const currentYear = new Date().getFullYear();
      
//       // Use sales order level invoice sequence
//       const nextSequence = this.salesOrder.invoices ? this.salesOrder.invoices.length + 1 : 1;
//       const invoiceNumber = `INV-${currentYear}-${nextSequence.toString().padStart(4, '0')}`;

//       selectedItems.forEach((item, index) => {
//         const dueDate = new Date();
//         dueDate.setDate(dueDate.getDate() + 30); // 30 days from now

//         newInvoices.push({
//           invoiceNumber: invoiceNumber, // Same invoice number for all items in this generation
//           invoiceSequence: nextSequence,
//           dueDate: dueDate,
//           amount: item.amount,
//           status: 'Pending' as const,
//           description: `Invoice for ${item.cameraName} - ${item.selectedDuration} months`,
//           generatedDate: new Date()
//         });
//       });

//       observer.next(newInvoices);
//       observer.complete();
//     });
//   }

//   generateAutomaticInvoice(): Observable<InvoiceData[]> {
//     const totalContractValue = this.salesOrder.cameras.reduce((total, camera) => {
//       return total + (camera.contractDuration * camera.monthlyFee);
//     }, 0);

//     let invoiceAmount = 0;
//     let description = '';

//     switch (this.automaticTrigger) {
//       case 'order':
//         invoiceAmount = totalContractValue;
//         description = 'Full contract value invoiced on order';
//         break;
//       case 'installation':
//         invoiceAmount = totalContractValue;
//         description = 'Full contract value invoiced on installation';
//         break;
//       case 'installments':
//         invoiceAmount = this.installmentAmount;
//         description = `Monthly installment of ${this.installmentAmount}`;
//         break;
//     }

//     if (invoiceAmount <= 0) {
//       return new Observable(observer => observer.next([]));
//     }

//     return new Observable(observer => {
//       const currentYear = new Date().getFullYear();
      
//       // Use sales order level invoice sequence
//       const nextSequence = this.salesOrder.invoices ? this.salesOrder.invoices.length + 1 : 1;
//       const invoiceNumber = `INV-${currentYear}-${nextSequence.toString().padStart(4, '0')}`;

//       const dueDate = new Date();
//       dueDate.setDate(dueDate.getDate() + 30);

//       const newInvoices = [{
//         invoiceNumber: invoiceNumber,
//         invoiceSequence: nextSequence,
//         dueDate: dueDate,
//         amount: invoiceAmount,
//         status: 'Pending' as const,
//         description: description,
//         generatedDate: new Date()
//       }];

//       observer.next(newInvoices);
//       observer.complete();
//     });
//   }
// } 