import type { Timestamp } from 'firebase/firestore';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  dueDate: Timestamp;
  status: 'todo' | 'in-progress' | 'done';
  createdAt: Timestamp;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}
