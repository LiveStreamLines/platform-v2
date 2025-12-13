export interface Memory {
  id: string;
  projectId: string;
  projectName?: string;
  title: string;
  description?: string;
  coverImage?: string;
  mediaItems: string[]; // Media item IDs
  timeframe: {
    start: string;
    end: string;
  };
  createdAt: string;
  updatedAt?: string;
}

