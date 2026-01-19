import { useState, useCallback, useEffect } from 'react';
import { authService } from '@/services/authService';
import { groupService } from '@/services/groupService';
import { expenseService } from '@/services/expenseService';
import { userService } from '@/services/userService';
import { User as FirebaseUser } from 'firebase/auth';
import type { 
  Group as FirestoreGroup, 
  Expense as FirestoreExpense, 
  Member, 
  Balance, 
  CreateGroupData,
  CreateExpenseData 
} from '@/types/firestore';
import type { Group as UIGroup, Expense as UIExpense } from '@/types/expense';

export function useExpenseStore() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [groups, setGroups] = useState<FirestoreGroup[]>([]);
  const [expenses, setExpenses] = useState<Record<string, FirestoreExpense[]>>({});
  const [members, setMembers] = useState<Record<string, Member[]>>({});
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert Firestore groups to UI groups with members and expenses
  const uiGroups: UIGroup[] = groups.map(group => ({
    id: group.id,
    name: group.name,
    members: members[group.id] || [],
    expenses: expenses[group.id] || [],
    createdAt: group.createdAt
  }));

  const selectedGroup = uiGroups.find((g) => g.id === selectedGroupId) || null;
  const selectedGroupExpenses = selectedGroup?.expenses || [];
  const selectedGroupMembers = selectedGroup?.members || [];

  // Initialize auth state
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          // Create/update user profile
          const profile = await userService.createOrUpdateUser(user);
          setUserProfile(profile);
          
          // Load user's groups
          await loadUserGroups(user.uid);
        } catch (err) {
          console.error('Error initializing user:', err);
          setError('Failed to load user data');
        }
      } else {
        setUserProfile(null);
        setGroups([]);
        setExpenses({});
        setMembers({});
        setSelectedGroupId(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load user groups
  const loadUserGroups = async (userId: string) => {
    try {
      const userGroups = await groupService.getUserGroups(userId);
      setGroups(userGroups);
      
      // Load expenses and members for each group
      for (const group of userGroups) {
        await loadGroupData(group.id);
      }
    } catch (err) {
      console.error('Error loading groups:', err);
      setError('Failed to load groups');
    }
  };

  // Load group data (expenses and members)
  const loadGroupData = async (groupId: string) => {
    try {
      // Load expenses
      const groupExpenses = await expenseService.getGroupExpenses(groupId);
      setExpenses(prev => ({ ...prev, [groupId]: groupExpenses }));

      // Load member details
      if (groups.find(g => g.id === groupId)) {
        const group = groups.find(g => g.id === groupId)!;
        const memberDetails = await userService.getUsers(group.memberIds);
        const membersWithIds = memberDetails.map(user => ({
          id: user.uid,
          name: user.name,
          email: user.email
        }));
        setMembers(prev => ({ ...prev, [groupId]: membersWithIds }));
      }
    } catch (err) {
      console.error('Error loading group data:', err);
    }
  };

  // Set up real-time listeners for selected group
  useEffect(() => {
    if (!selectedGroupId) return;

    // Listen for expense changes
    const unsubscribeExpenses = expenseService.onGroupExpensesChange(
      selectedGroupId,
      (newExpenses) => {
        setExpenses(prev => ({ ...prev, [selectedGroupId]: newExpenses }));
      }
    );

    return () => unsubscribeExpenses();
  }, [selectedGroupId]);

  // Create group
  const createGroup = useCallback(async (name: string, memberData: Omit<Member, 'id'>[]) => {
    if (!currentUser) throw new Error('User not authenticated');

    try {
      // Create member with current user included
      const allMembers: Member[] = [
        { id: currentUser.uid, name: userProfile?.name || currentUser.displayName || '', email: currentUser.email },
        ...memberData.map(m => ({ ...m, id: Math.random().toString(36).substring(2, 11) }))
      ];

      const groupData: CreateGroupData = {
        name,
        createdBy: currentUser.uid,
        memberIds: allMembers.map(m => m.id)
      };

      const newGroup = await groupService.createGroup(groupData);
      setGroups(prev => [newGroup, ...prev]);
      
      // Load data for new group
      await loadGroupData(newGroup.id);
      setSelectedGroupId(newGroup.id);

      return newGroup;
    } catch (err) {
      console.error('Error creating group:', err);
      setError('Failed to create group');
      throw err;
    }
  }, [currentUser, userProfile]);

  // Add member to group
  const addMember = useCallback(async (groupId: string, memberData: Omit<Member, 'id'>) => {
    if (!currentUser) throw new Error('User not authenticated');

    try {
      const memberId = Math.random().toString(36).substring(2, 11);
      
      // Add to group
      await groupService.addMemberToGroup(groupId, memberId);
      
      // Update local state
      setGroups(prev => prev.map(g => 
        g.id === groupId 
          ? { ...g, memberIds: [...g.memberIds, memberId] }
          : g
      ));

      // Update members list
      const newMember: Member = {
        id: memberId,
        name: memberData.name,
        email: memberData.email
      };
      
      setMembers(prev => ({
        ...prev,
        [groupId]: [...(prev[groupId] || []), newMember]
      }));

      return newMember;
    } catch (err) {
      console.error('Error adding member:', err);
      setError('Failed to add member');
      throw err;
    }
  }, [currentUser]);

  // Remove member from group
  const removeMember = useCallback(async (groupId: string, memberId: string) => {
    if (!currentUser) throw new Error('User not authenticated');

    try {
      await groupService.removeMemberFromGroup(groupId, memberId);
      
      // Update local state
      setGroups(prev => prev.map(g => 
        g.id === groupId 
          ? { ...g, memberIds: g.memberIds.filter(id => id !== memberId) }
          : g
      ));

      setMembers(prev => ({
        ...prev,
        [groupId]: prev[groupId]?.filter(m => m.id !== memberId) || []
      }));
    } catch (err) {
      console.error('Error removing member:', err);
      setError('Failed to remove member');
      throw err;
    }
  }, [currentUser]);

  // Add expense
  const addExpense = useCallback(async (groupId: string, expenseData: Omit<CreateExpenseData, 'groupId'>) => {
    if (!currentUser) throw new Error('User not authenticated');

    try {
      const fullExpenseData: CreateExpenseData = {
        ...expenseData,
        groupId
      };

      const newExpense = await expenseService.createExpense(fullExpenseData);
      
      // Update local state
      setExpenses(prev => ({
        ...prev,
        [groupId]: [newExpense, ...(prev[groupId] || [])]
      }));

      return newExpense;
    } catch (err) {
      console.error('Error adding expense:', err);
      setError('Failed to add expense');
      throw err;
    }
  }, [currentUser]);

  // Delete expense
  const deleteExpense = useCallback(async (groupId: string, expenseId: string) => {
    if (!currentUser) throw new Error('User not authenticated');

    try {
      await expenseService.deleteExpense(expenseId);
      
      // Update local state
      setExpenses(prev => ({
        ...prev,
        [groupId]: prev[groupId]?.filter(e => e.id !== expenseId) || []
      }));
    } catch (err) {
      console.error('Error deleting expense:', err);
      setError('Failed to delete expense');
      throw err;
    }
  }, [currentUser]);

  // Calculate balances
  const calculateBalances = useCallback((groupId: string): Balance[] => {
    const groupExpenses = expenses[groupId] || [];
    const groupMembers = members[groupId] || [];
    const balanceMap: Record<string, number> = {};

    // Initialize balances for all members
    groupMembers.forEach((m) => {
      balanceMap[m.id] = 0;
    });

    // Calculate balances from expenses
    groupExpenses.forEach((expense) => {
      const splitAmount = expense.amount / expense.splitBetween.length;
      
      // Payer gets credited full amount
      balanceMap[expense.paidBy] += expense.amount;
      
      // Each person in split owes their share
      expense.splitBetween.forEach((memberId) => {
        balanceMap[memberId] -= splitAmount;
      });
    });

    // Convert to balance pairs (who owes whom)
    const balances: Balance[] = [];
    const memberIds = Object.keys(balanceMap);

    // Simplify debts
    const creditors = memberIds.filter((id) => balanceMap[id] > 0.01);
    const debtors = memberIds.filter((id) => balanceMap[id] < -0.01);

    creditors.forEach((creditor) => {
      let creditAmount = balanceMap[creditor];
      
      debtors.forEach((debtor) => {
        if (creditAmount <= 0.01) return;
        
        const debtAmount = Math.abs(balanceMap[debtor]);
        if (debtAmount <= 0.01) return;
        
        const settleAmount = Math.min(creditAmount, debtAmount);
        
        if (settleAmount > 0.01) {
          balances.push({
            from: debtor,
            to: creditor,
            amount: Math.round(settleAmount * 100) / 100,
          });
          
          creditAmount -= settleAmount;
          balanceMap[debtor] += settleAmount;
        }
      });
    });

    return balances.sort((a, b) => b.amount - a.amount);
  }, [expenses, members]);

  // Get group total
  const getGroupTotal = useCallback((groupId: string): number => {
    return expenses[groupId]?.reduce((sum, e) => sum + e.amount, 0) || 0;
  }, [expenses]);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      await authService.signOut();
    } catch (err) {
      console.error('Error signing out:', err);
      setError('Failed to sign out');
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Auth state
    currentUser,
    userProfile,
    loading,
    error,
    clearError,
    signOut,

    // Groups (UI compatible)
    groups: uiGroups,
    selectedGroup,
    selectedGroupId,
    setSelectedGroupId,
    createGroup,
    
    // Members
    selectedGroupMembers,
    addMember,
    removeMember,
    
    // Expenses
    selectedGroupExpenses,
    addExpense,
    deleteExpense,
    
    // Calculations
    calculateBalances,
    getGroupTotal,
  };
}
