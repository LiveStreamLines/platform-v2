export interface Maintenance {
    _id?: string;
    dateOfRequest: string;
    taskType: string;
    taskDescription: string;
    assignedUsers: string[];
    userComment: string;
    status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
    cameraId: string;
    developerId?: string;
    projectId?: string;
    isActive?: boolean;
    createdDate?: string;
    completedDate?: string;
    startTime?: string;
    completionTime?: string;
}

export const TASK_TYPES = [
    'Camera Installation',
    'Camera Repair',
    'Camera Maintenance',
    'Network Issues',
    'Software Update',
    'Hardware Replacement',
    'Other'
]; 