export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  senderType: 'customer' | 'support';
  content: string;
  timestamp: string;
  read: boolean;
  attachments?: string[];
}

export interface MessageThread {
  id: string;
  projectId?: string;
  projectName?: string;
  subject: string;
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
  participants: {
    id: string;
    name: string;
    type: 'customer' | 'support';
  }[];
}

