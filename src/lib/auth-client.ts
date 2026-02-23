'use client';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import { auth, db } from './firebase/client';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { setCookie } from 'cookies-next';

export async function signInWithEmailClient(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();
    setCookie('firebase-auth', token, { path: '/' });
    return { user: userCredential.user };
  } catch (error: any) {
    return { error: 'Invalid email or password.' };
  }
}

export async function signUpWithEmailClient(displayName: string, email: string, password: string) {
    try {
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );
        const { user } = userCredential;

        // Update the profile with the display name
        await updateProfile(user, {
            displayName,
        });

        // Create a user document in Firestore with the user's UID as the document ID
        await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            displayName,
            email,
        });
        
        const token = await user.getIdToken();
        setCookie('firebase-auth', token, { path: '/' });

        return { user };
    } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
            return { error: 'This email address is already in use.' };
        }
        return { error: 'An unexpected error occurred during sign-up.' };
    }
}

export async function signOutClient() {
  try {
    await firebaseSignOut(auth);
    // The onIdTokenChanged listener in useAuth will handle cookie deletion
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateUserProfileClient(displayName: string) {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error("You must be logged in to update your profile.");
        }
        
        // Update auth profile
        await updateProfile(user, {
            displayName
        });

        // Update firestore profile
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, {
            displayName
        });
        
        // Force refresh the token. The onIdTokenChanged listener in useAuth will handle updating the cookie.
        await user.getIdToken(true);
        
        return { success: true, message: "Profile updated successfully!" };

    } catch (error: any) {
        return { error: error.message };
    }
}
