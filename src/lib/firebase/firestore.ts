import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from './client';
import type { Task, UserProfile } from '../types';

export async function getTasksForUser(userId: string): Promise<Task[]> {
  const tasksRef = collection(db, 'tasks');
  const q = query(tasksRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
  
  const querySnapshot = await getDocs(q);
  const tasks = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Task[];
  
  return tasks;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
    }

    // Fallback for users created before the firestore profile entry
    const authUser = (await import('./client')).auth.currentUser;
    if(authUser && authUser.uid === userId) {
        return {
            uid: authUser.uid,
            email: authUser.email,
            displayName: authUser.displayName,
            photoURL: authUser.photoURL
        }
    }

    return null;
}
