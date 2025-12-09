export interface Developer {
    "_id": string,
    "isActive": boolean,
    "developerName": string,
    "developerTag": string,
    "description": string,
    "createdDate": string,
    "logo": string,
    // Contact Information
    "email": string,
    "phone": string,
    "website": string,
    // Business Information
    "vatNumber": string,
    "taxId": string,
    "businessLicense": string,
    // Address Information
    "address": {
        "street": string,
        "city": string,
        "state": string,
        "zipCode": string,
        "country": string
    },
    // Additional Information
    "contactPerson": {
        "name": string,
        "position": string,
        "email": string,
        "phone": string
    },
    "bankDetails": {
        "bankName": string,
        "accountNumber": string,
        "iban": string,
        "swiftCode": string
    }
}
  