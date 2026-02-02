export type Role = 'Admin' | 'Visitor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isBlocked: boolean;
  department?: string;
  avatarUrl?: string;
}

export type VisitStatus = 'Waiting' | 'In-Meeting' | 'Completed';
export type VisitType = 'Library' | 'Dean';

export interface VisitLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  department: string;
  reason: string;
  timestamp: string;
  status: VisitStatus;
  type: VisitType;
  idNumber?: string;
}

export const DEPARTMENTS = [
  'College of Engineering',
  'College of Architecture',
  'College of Business',
  'College of Arts and Sciences',
  'College of Information Technology',
  'Graduate School',
];

export const VISIT_REASONS_LIBRARY = [
  'Research',
  'Study',
  'Book Borrowing/Return',
  'Quiet Area Access',
  'Computer Lab Usage',
  'Group Meeting',
];

export const VISIT_REASONS_DEAN = [
  'Inquiry',
  'Signature',
  'Meeting',
  'Scholarship',
  'Others',
];

export const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@neu.edu.ph',
    role: 'Admin',
    isBlocked: false,
    avatarUrl: 'https://picsum.photos/seed/admin/100/100',
  },
  {
    id: '2',
    name: 'John Doe',
    email: 'j.doe@neu.edu.ph',
    role: 'Visitor',
    isBlocked: false,
    department: 'College of Information Technology',
    avatarUrl: 'https://picsum.photos/seed/johndoe/100/100',
  },
  {
    id: '3',
    name: 'Jane Smith',
    email: 'j.smith@neu.edu.ph',
    role: 'Visitor',
    isBlocked: false,
    department: 'College of Engineering',
    avatarUrl: 'https://picsum.photos/seed/janesmith/100/100',
  },
  {
    id: '4',
    name: 'Blocked Student',
    email: 'b.student@neu.edu.ph',
    role: 'Visitor',
    isBlocked: true,
    department: 'College of Architecture',
    avatarUrl: 'https://picsum.photos/seed/blocked/100/100',
  },
];

export const MOCK_VISITS: VisitLog[] = [
  {
    id: 'v1',
    userId: '2',
    userName: 'John Doe',
    userEmail: 'j.doe@neu.edu.ph',
    department: 'College of Information Technology',
    reason: 'Study',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    status: 'Completed',
    type: 'Library',
  },
  {
    id: 'v2',
    userId: '3',
    userName: 'Jane Smith',
    userEmail: 'j.smith@neu.edu.ph',
    department: 'College of Engineering',
    reason: 'Signature',
    timestamp: new Date().toISOString(),
    status: 'Waiting',
    type: 'Dean',
    idNumber: '2023-10042',
  },
  {
    id: 'v3',
    userId: '2',
    userName: 'John Doe',
    userEmail: 'j.doe@neu.edu.ph',
    department: 'College of Information Technology',
    reason: 'Meeting',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    status: 'Completed',
    type: 'Dean',
    idNumber: '2023-10022',
  },
  {
    id: 'v4',
    userId: '3',
    userName: 'Jane Smith',
    userEmail: 'j.smith@neu.edu.ph',
    department: 'College of Engineering',
    reason: 'Research',
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    status: 'Completed',
    type: 'Library',
  },
];