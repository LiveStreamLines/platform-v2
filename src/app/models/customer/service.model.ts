export type ServiceType = 'drone' | 'site-photography' | 'site-videography' | '360-photography' | '360-videography' | 'satellite';

export type ServiceStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';

export interface ServiceRequest {
  id: string;
  projectId: string;
  projectName?: string;
  type: ServiceType;
  status: ServiceStatus;
  details: string;
  preferredDates?: {
    start: string;
    end: string;
  };
  notes?: string;
  media?: string[]; // Media item IDs
  createdAt: string;
  completedAt?: string;
  internalNotes?: string; // Optional, for customer view
}

