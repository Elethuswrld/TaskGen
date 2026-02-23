'use server';

import { db } from '@/lib/firebase/client';
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

// Auth and profile update actions are now in a client utility: src/lib/auth-client.ts

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
