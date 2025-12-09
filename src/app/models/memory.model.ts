// memory.model.ts
export interface Memory {
  _id?: string; // Optional for new entries
  developer: string;
  project: string;
  camera: string;
  createdDate: Date | string;
  endDate: Date | string;
  numberOfPics: number;
  memoryAvailable: string;
  shuttercount?: number; // New field for shutter count
  dateOfRemoval?: Date | string | null;  // Allow null
  dateOfReceive?: Date | string | null;  // Allow null
  status: 'active' | 'removed' | 'archived';
}