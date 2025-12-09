export interface ProjectAttachment {
  _id?: string;
  name: string;
  originalName: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface Project {
  _id: string,
  projectName: string,
  projectTag: string,
  description: string,
  developer: string,
  index: string,
  isActive: boolean,
  createdDate: string,
  createdAt?: string;
  updatedAt?: string;
  logo: string,
  blocked?: string,
  status: 'new' | 'active' | 'on hold' | 'finished',
  attachments?: ProjectAttachment[];
}
  