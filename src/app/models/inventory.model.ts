export interface Device {
    type: string;
    serialNumber: string;
    model?: string;
    purchaseDate?: Date;
  }
  
  export interface DeveloperReference {
    _id: string;
    name: string;
  }
  
  export interface ProjectReference {
    _id: string;
    name: string;
  }
  
  export interface CameraReference {
    _id: string;
    name: string;
  }
  
  export interface Assignment {
    developer: string;
    project: string;
    camera: string;
    assignedDate: Date;
    notes?: string;
  }
  
  export interface UserAssignment {
    userId: string;
    userName: string;
    assignedDate: Date;
    notes?: string;
  }
  
  export interface HistoricalUserAssignment extends UserAssignment {
    removedDate: Date;
    removalReason?: string;
  }
  
  export interface HistoricalAssignment extends Assignment {
    removedDate: Date;
    removalReason?: string;
  }
  
  export interface InventoryItem {
    _id: string;
    device: Device;
    currentAssignment?: Assignment;
    currentUserAssignment?: UserAssignment;
    assignmentHistory: HistoricalAssignment[];
    userAssignmentHistory: HistoricalUserAssignment[];
    status: 'available' | 'assigned' | 'retired' | 'maintenance';
    ageInDays: number;
    validityDays: number;
    createdAt?: Date;
    updatedAt?: Date;
  }