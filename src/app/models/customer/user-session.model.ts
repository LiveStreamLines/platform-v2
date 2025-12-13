export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin' | 'super-admin';
  phone?: string;
  avatar?: string;
}

