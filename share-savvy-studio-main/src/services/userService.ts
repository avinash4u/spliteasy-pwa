import { db } from '@/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  DocumentData
} from 'firebase/firestore';
import { User as FirebaseUser } from 'firebase/auth';

export interface User {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  createdAt: Date;
}

class UserService {
  private usersCollection = collection(db, 'users');

  // Create or update user profile
  async createOrUpdateUser(firebaseUser: FirebaseUser): Promise<User> {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userRef);
      
      const userData = {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || '',
        email: firebaseUser.email || '',
        photoURL: firebaseUser.photoURL || null,
        updatedAt: serverTimestamp()
      };

      if (userDoc.exists()) {
        // Update existing user
        await updateDoc(userRef, userData);
      } else {
        // Create new user
        await setDoc(userRef, {
          ...userData,
          createdAt: serverTimestamp()
        });
      }

      // Return updated user data
      const updatedDoc = await getDoc(userRef);
      return this.mapDocumentToUser(updatedDoc);
    } catch (error) {
      console.error('Error creating/updating user:', error);
      throw error;
    }
  }

  // Get user by ID
  async getUser(userId: string): Promise<User | null> {
    try {
      const userRef = doc(db, 'users', userId);
      const docSnap = await getDoc(userRef);
      
      if (docSnap.exists()) {
        return this.mapDocumentToUser(docSnap);
      }
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  // Get multiple users by IDs
  async getUsers(userIds: string[]): Promise<User[]> {
    try {
      const userPromises = userIds.map(id => this.getUser(id));
      const users = await Promise.all(userPromises);
      return users.filter((user): user is User => user !== null);
    } catch (error) {
      console.error('Error getting users:', error);
      throw error;
    }
  }

  // Update user profile
  async updateUser(userId: string, updates: Partial<Omit<User, 'uid' | 'createdAt'>>): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Helper method to map Firestore document to User
  private mapDocumentToUser(doc: any): User {
    const data = doc.data();
    return {
      uid: data.uid,
      name: data.name,
      email: data.email,
      photoURL: data.photoURL || undefined,
      createdAt: data.createdAt?.toDate() || new Date()
    };
  }
}

export const userService = new UserService();
