export interface Project {
  id: string;
  name: string;
  description?: string;
  location: string;
  developerId?: string;
  developerName?: string;
  status: 'active' | 'completed' | 'on-hold';
  startDate?: string;
  endDate?: string;
  stats?: {
    cameraCount: number;
    recentUploads: number;
    activeServices: number;
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
}

