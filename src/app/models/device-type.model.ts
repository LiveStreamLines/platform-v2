// models/device-type.model.ts
export interface DeviceType {
    _id?: string;
    name: string;
    validityDays: number;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}