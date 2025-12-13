export type MediaType = 'photo' | 'video' | 'timelapse' | 'drone' | '360' | 'satellite';

export interface MediaItem {
  id: string;
  type: MediaType;
  url: string;
  thumbnailUrl?: string;
  projectId: string;
  projectName?: string;
  cameraId?: string;
  cameraName?: string;
  timestamp: string;
  tags?: string[];
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    size?: number;
  };
}

