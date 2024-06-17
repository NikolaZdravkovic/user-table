export interface User {
    id: number;
    firstName: string;
    lastName: string;
    gender: 'Male' | 'Female' | 'Other';
    dob: number;
    status: 'Approved' | 'Pending' | 'Declined';
    createdAt: number;
    updatedAt: number;
  }
  