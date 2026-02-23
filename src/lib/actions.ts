'use server';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase/client';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';

// Auth Actions
const signUpSchema = z.object({
  displayName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function signUpWithEmail(values: z.infer<typeof signUpSchema>) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      values.email,
      values.password
    );
    await updateProfile(userCredential.user, {
      displayName: values.displayName,
    });
    // Create user profile in Firestore
    await addDoc(collection(db, 'users'), {
      uid: userCredential.user.uid,
      displayName: values.displayName,
      email: values.email,
    });

    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function signInWithEmail(values: z.infer<typeof signInSchema>) {
  try {
    await signInWithEmailAndPassword(auth, values.email, values.password);
    return { success: true };
  } catch (error: any) {
    return { error: 'Invalid email or password.' };
  }
}

export async function signOut() {
  try {
    await auth.signOut();
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

// Task Actions
const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  dueDate: z.date(),
  status: z.enum(['todo', 'in-progress', 'done']),
});

export async function createTask(
  userId: string,
  values: z.infer<typeof taskSchema>
) {
  try {
    await addDoc(collection(db, 'tasks'), {
      ...values,
      userId,
      createdAt: serverTimestamp(),
      dueDate: Timestamp.fromDate(values.dueDate),
    });
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateTask(
  taskId: string,
  values: z.infer<typeof taskSchema>
) {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, {
        ...values,
        dueDate: Timestamp.fromDate(values.dueDate),
    });
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteTask(taskId: string) {
  try {
    await deleteDoc(doc(db, 'tasks', taskId));
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

// Profile Actions
const profileSchema = z.object({
    displayName: z.string().min(2, 'Name must be at least 2 characters.'),
});

export async function updateUserProfile(userId: string, values: z.infer<typeof profileSchema>) {
    try {
        const user = auth.currentUser;
        if (!user || user.uid !== userId) {
            throw new Error("You are not authorized to perform this action.");
        }
        await updateProfile(user, {
            displayName: values.displayName
        });

        const userDocRef = doc(db, "users", userId);
        await updateDoc(userDocRef, {
            displayName: values.displayName
        });

        revalidatePath('/profile');
        revalidatePath('/dashboard');
        return { success: true, message: "Profile updated successfully!" };

    } catch (error: any) {
        return { error: error.message };
    }
}
