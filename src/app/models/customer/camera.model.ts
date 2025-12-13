export interface Camera {
  id: string;
  name: string;
  projectId: string;
  projectName?: string;
  type: string;
  status: 'online' | 'offline' | 'maintenance';
  location?: string;
  lastImageAt?: string;
  streamUrl?: string;
  thumbnailUrl?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  tags?: string[];
}

