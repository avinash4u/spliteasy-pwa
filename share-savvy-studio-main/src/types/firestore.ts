// Re-export types from services for consistency
export type { User } from '@/services/userService';
export type { Group, CreateGroupData } from '@/services/groupService';
export type { Expense, CreateExpenseData, Settlement, CreateSettlementData } from '@/services/expenseService';

// Import types for internal use
import type { Expense as FirestoreExpense } from '@/services/expenseService';
import type { Group as FirestoreGroupType } from '@/services/groupService';

// Extended types for UI compatibility
export interface Member {
  id: string;
  name: string;
  email?: string;
}

export interface Balance {
  from: string;
  to: string;
  amount: number;
}

// UI Group type that includes expenses and members
export interface UIGroup extends FirestoreGroupType {
  members: Member[];
  expenses: FirestoreExpense[];
}

// Helper function to convert Firestore types to UI types
export const createUIGroup = (
  group: FirestoreGroupType, 
  members: Member[], 
  expenses: FirestoreExpense[]
): UIGroup => ({
  ...group,
  members,
  expenses
});
