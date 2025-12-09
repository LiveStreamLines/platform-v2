export interface User {
    _id: string;
    name: string;
    email: string;
    password?: string; // Optional if passwords are not exposed
    phone: string;
    role: 'Super Admin' | 'Admin' | 'User';
    accessibleDevelopers: string[]; // Array of developer IDs
    accessibleProjects: string[]; // Array of project IDs
    accessibleCameras: string[]; // Array of camera IDs
    accessibleServices: string[]; // Array of service names
    canAddUser?: boolean; // Permission to add users
    canGenerateVideoAndPics?: boolean; // Permission to generate video and pictures
    addedUserId?: string; // ID of user who added this user
    addedUserName?: string; // Name of user who added this user
    status?: string; // User status (New, Reset Password Sent, Phone Required, active, etc.)
    token?: string; // Optional if token is not always present
    memoryRole?: 'tech' | 'memory-admin';
    inventoryRole?: 'tech' | 'invenotry-admin';
    createdDate: string;
    manual?: boolean;
    LastLoginTime?: string;
  }
  