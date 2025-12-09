export interface Camera {
    "_id": string,
    "project": string,
    "developer": string,
    "camera": string,
    "cameraId"?: string,
    "cameraDescription": string,
    "cindex"?: number,
    "lat": string,
    "lng": string,
    "firstPhoto": string,
    "lastPhoto": string,
    "path": string,
    "customVideo1"?: string,
    "customVideo2"?: string,
    "isDeleted"?: boolean,
    "isActive": boolean,
    "error"?: boolean,
    "country"?: string,
    "serverFolder": string,
    "createdDate": string,
    "blocked"?: boolean,
    // New fields for sales order integration
    "projectTag"?: string,
    "developerTag"?: string,
    "status"?: 'Pending' | 'Installed' | 'Active' | 'Removed',
    "installedDate"?: string | null,
    "monthlyFee"?: number,
    "contractDuration"?: number,
    // Sales order and invoice tracking
    "salesOrderId"?: string,
    "salesOrderNumber"?: string,
    "invoicedDuration"?: number,
    "invoices"?: {
        "invoiceNumber": string,
        "invoiceSequence": number,
        "amount": number,
        "duration": number,
        "generatedDate": Date,
        "status": 'Pending' | 'Paid' | 'Overdue'
    }[]
  }
  