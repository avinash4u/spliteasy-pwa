import { auth } from '@/firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithPhoneNumber,
  RecaptchaVerifier,
  User,
  UserCredential,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  createdAt: Date;
}

class AuthService {
  private googleProvider: GoogleAuthProvider;

  constructor() {
    this.googleProvider = new GoogleAuthProvider();
  }

  // Sign in with Google
  async signInWithGoogle(): Promise<UserCredential> {
    try {
      return await signInWithPopup(auth, this.googleProvider);
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  }

  // Sign in with Phone (requires reCAPTCHA setup)
  async signInWithPhone(phoneNumber: string, recaptchaVerifier: RecaptchaVerifier): Promise<any> {
    try {
      return await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    } catch (error) {
      console.error('Phone sign-in error:', error);
      throw error;
    }
  }

  // Create reCAPTCHA verifier for phone auth
  createRecaptchaVerifier(container: string | HTMLElement): RecaptchaVerifier {
    return new RecaptchaVerifier(auth, container, {
      size: 'invisible',
      callback: (response: any) => {
        console.log('reCAPTCHA solved', response);
      }
    });
  }

  // Get current user
  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  // Listen to auth state changes
  onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  // Get user profile data
  getUserProfile(user: User): UserProfile {
    return {
      uid: user.uid,
      name: user.displayName || '',
      email: user.email || '',
      photoURL: user.photoURL || undefined,
      createdAt: user.metadata.creationTime ? new Date(user.metadata.creationTime) : new Date()
    };
  }
}

export const authService = new AuthService();
