export type TimeLapseStatus = 'pending' | 'in-progress' | 'ready' | 'failed';

export interface TimeLapseRequest {
  id: string;
  projectId: string;
  projectName?: string;
  cameraId: string;
  cameraName?: string;
  dateRange: {
    start: string;
    end: string;
  };
  resolution?: string;
  overlayLogo?: boolean;
  notes?: string;
  status: TimeLapseStatus;
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  createdAt: string;
  completedAt?: string;
}

