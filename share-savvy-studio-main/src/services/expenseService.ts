import { db } from '@/firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  DocumentData,
  QuerySnapshot
} from 'firebase/firestore';

export interface Expense {
  id: string;
  groupId: string;
  amount: number;
  paidBy: string;
  splitBetween: string[];
  description: string;
  splitType: 'equal' | 'custom';
  customSplits?: Record<string, number>;
  createdAt: Date;
}

export interface CreateExpenseData {
  groupId: string;
  amount: number;
  paidBy: string;
  splitBetween: string[];
  description: string;
}

export interface Settlement {
  id: string;
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  createdAt: Date;
}

export interface CreateSettlementData {
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
}

class ExpenseService {
  private expensesCollection = collection(db, 'expenses');
  private settlementsCollection = collection(db, 'settlements');

  // Create a new expense
  async createExpense(expenseData: CreateExpenseData): Promise<Expense> {
    try {
      const docRef = await addDoc(this.expensesCollection, {
        ...expenseData,
        createdAt: serverTimestamp()
      });
      
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error('Failed to create expense');
      }
      
      return this.mapDocumentToExpense(docSnap);
    } catch (error) {
      console.error('Error creating expense:', error);
      throw error;
    }
  }

  // Update an expense
  async updateExpense(expenseId: string, updates: Partial<CreateExpenseData>): Promise<void> {
    try {
      const expenseRef = doc(db, 'expenses', expenseId);
      await updateDoc(expenseRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  }

  // Delete an expense
  async deleteExpense(expenseId: string): Promise<void> {
    try {
      const expenseRef = doc(db, 'expenses', expenseId);
      await deleteDoc(expenseRef);
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  }

  // Get all expenses for a group
  async getGroupExpenses(groupId: string): Promise<Expense[]> {
    try {
      const q = query(
        this.expensesCollection,
        where('groupId', '==', groupId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.mapDocumentToExpense(doc));
    } catch (error) {
      console.error('Error getting group expenses:', error);
      throw error;
    }
  }

  // Real-time listener for group expenses
  onGroupExpensesChange(groupId: string, callback: (expenses: Expense[]) => void) {
    const q = query(
      this.expensesCollection,
      where('groupId', '==', groupId),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
      const expenses = querySnapshot.docs.map(doc => this.mapDocumentToExpense(doc));
      callback(expenses);
    }, (error) => {
      console.error('Error listening to expenses:', error);
    });
  }

  // Create a settlement
  async createSettlement(settlementData: CreateSettlementData): Promise<Settlement> {
    try {
      const docRef = await addDoc(this.settlementsCollection, {
        ...settlementData,
        createdAt: serverTimestamp()
      });
      
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error('Failed to create settlement');
      }
      
      return this.mapDocumentToSettlement(docSnap);
    } catch (error) {
      console.error('Error creating settlement:', error);
      throw error;
    }
  }

  // Get all settlements for a group
  async getGroupSettlements(groupId: string): Promise<Settlement[]> {
    try {
      const q = query(
        this.settlementsCollection,
        where('groupId', '==', groupId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.mapDocumentToSettlement(doc));
    } catch (error) {
      console.error('Error getting group settlements:', error);
      throw error;
    }
  }

  // Real-time listener for group settlements
  onGroupSettlementsChange(groupId: string, callback: (settlements: Settlement[]) => void) {
    const q = query(
      this.settlementsCollection,
      where('groupId', '==', groupId),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
      const settlements = querySnapshot.docs.map(doc => this.mapDocumentToSettlement(doc));
      callback(settlements);
    }, (error) => {
      console.error('Error listening to settlements:', error);
    });
  }

  // Delete a settlement
  async deleteSettlement(settlementId: string): Promise<void> {
    try {
      const settlementRef = doc(db, 'settlements', settlementId);
      await deleteDoc(settlementRef);
    } catch (error) {
      console.error('Error deleting settlement:', error);
      throw error;
    }
  }

  // Helper method to map Firestore document to Expense
  private mapDocumentToExpense(doc: any): Expense {
    const data = doc.data();
    return {
      id: doc.id,
      groupId: data.groupId,
      amount: data.amount,
      paidBy: data.paidBy,
      splitBetween: data.splitBetween || [],
      description: data.description,
      splitType: data.splitType || 'equal',
      customSplits: data.customSplits,
      createdAt: data.createdAt?.toDate() || new Date()
    };
  }

  // Helper method to map Firestore document to Settlement
  private mapDocumentToSettlement(doc: any): Settlement {
    const data = doc.data();
    return {
      id: doc.id,
      groupId: data.groupId,
      fromUserId: data.fromUserId,
      toUserId: data.toUserId,
      amount: data.amount,
      createdAt: data.createdAt?.toDate() || new Date()
    };
  }
}

export const expenseService = new ExpenseService();
