import { useState, useCallback, useEffect } from 'react';
import { Group, Expense, Member, Balance } from '@/types/expense';
import { apiService } from '@/services/apiService';

// Generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 11);

// Load data from localStorage (fallback)
const loadGroupsFromStorage = (): Group[] => {
  try {
    const stored = localStorage.getItem('spliteasy-groups');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convert date strings back to Date objects
      return parsed.map((group: any) => ({
        ...group,
        createdAt: new Date(group.createdAt),
        expenses: group.expenses.map((expense: any) => ({
          ...expense,
          createdAt: new Date(expense.createdAt)
        }))
      }));
    }
  } catch (error) {
    console.error('Error loading groups from storage:', error);
  }
  return [];
};

// Save data to localStorage (fallback)
const saveGroupsToStorage = (groups: Group[]) => {
  try {
    localStorage.setItem('spliteasy-groups', JSON.stringify(groups));
  } catch (error) {
    console.error('Error saving groups to storage:', error);
  }
};

// Get initial groups (localStorage first, then try API)
const getInitialGroups = async (): Promise<Group[]> => {
  // Always load from localStorage first for immediate UI
  const stored = loadGroupsFromStorage();
  console.log('Loaded groups from localStorage:', stored.length);
  
  // Try to sync with API in background
  try {
    const apiGroups = await apiService.getGroups();
    if (apiGroups.length > 0) {
      console.log('Loaded groups from API:', apiGroups.length);
      return apiGroups; // Use API data if available
    }
  } catch (error) {
    console.log('API not available, using localStorage data');
  }
  
  return stored; // Always return localStorage data as fallback
};

export function useExpenseStore() {
  const [groups, setGroups] = useState<Group[]>(loadGroupsFromStorage());
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // Start with false for immediate UI

  const selectedGroup = groups.find((g) => g.id === selectedGroupId) || null;

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const apiGroups = await getInitialGroups();
        if (apiGroups.length > 0) {
          setGroups(apiGroups);
        }
      } catch (error) {
        console.log('Background sync failed, using localStorage');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Save to localStorage whenever groups change (for offline support)
  useEffect(() => {
    if (!loading && groups.length > 0) {
      saveGroupsToStorage(groups);
    }
  }, [groups, loading]);

  // Sync with API
  const syncWithAPI = useCallback(async () => {
    try {
      const apiGroups = await apiService.getGroups();
      setGroups(apiGroups);
      console.log('Synced groups with API');
    } catch (error) {
      console.log('API sync failed, using local data');
    }
  }, []);

  const createGroup = useCallback(async (name: string, members: Omit<Member, 'id'>[]) => {
    const newGroupData = {
      name,
      members: members.map((m) => ({ ...m, id: generateId() })),
      expenses: [],
    };

    try {
      // Try to create on API first
      const newGroup = await apiService.createGroup(newGroupData);
      setGroups((prev) => [...prev, newGroup]);
      setSelectedGroupId(newGroup.id);
      console.log('Group created on API:', newGroup.name);
      return newGroup;
    } catch (error) {
      console.log('API create failed, using local storage');
      // Fallback to local storage
      const newGroup: Group = {
        ...newGroupData,
        id: generateId(),
        createdAt: new Date(),
      };
      setGroups((prev) => [...prev, newGroup]);
      setSelectedGroupId(newGroup.id);
      return newGroup;
    }
  }, []);

  const addMember = useCallback(async (groupId: string, member: Omit<Member, 'id'>) => {
    try {
      // Try to add on API first
      const newMember = await apiService.addMember(groupId, member);
      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId ? { ...g, members: [...g.members, newMember] } : g
        )
      );
      console.log('Member added on API:', newMember.name);
      return newMember;
    } catch (error) {
      console.log('API add member failed, using local storage');
      // Fallback to local storage
      const newMember = { ...member, id: generateId() };
      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId ? { ...g, members: [...g.members, newMember] } : g
        )
      );
      return newMember;
    }
  }, []);

  const removeMember = useCallback(async (groupId: string, memberId: string) => {
    try {
      // Try to remove on API first
      await apiService.removeMember(groupId, memberId);
      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId
            ? { ...g, members: g.members.filter((m) => m.id !== memberId) }
            : g
        )
      );
      console.log('Member removed on API');
    } catch (error) {
      console.log('API remove member failed, using local storage');
      // Fallback to local storage
      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId
            ? { ...g, members: g.members.filter((m) => m.id !== memberId) }
            : g
        )
      );
    }
  }, []);

  const addExpense = useCallback(async (
    groupId: string,
    expense: Omit<Expense, 'id' | 'createdAt' | 'groupId'>
  ) => {
    try {
      // Try to add on API first
      const newExpense = await apiService.addExpense(groupId, expense);
      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId ? { ...g, expenses: [...g.expenses, newExpense] } : g
        )
      );
      console.log('Expense added on API:', newExpense.description, '₹' + newExpense.amount);
      return newExpense;
    } catch (error) {
      console.log('API add expense failed, using local storage');
      // Fallback to local storage
      const newExpense: Expense = {
        ...expense,
        id: generateId(),
        createdAt: new Date(),
        groupId,
      };
      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId ? { ...g, expenses: [...g.expenses, newExpense] } : g
        )
      );
      return newExpense;
    }
  }, []);

  const deleteExpense = useCallback(async (groupId: string, expenseId: string) => {
    try {
      // Try to delete on API first
      await apiService.deleteExpense(groupId, expenseId);
      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId
            ? { ...g, expenses: g.expenses.filter((e) => e.id !== expenseId) }
            : g
        )
      );
      console.log('Expense deleted on API');
    } catch (error) {
      console.log('API delete expense failed, using local storage');
      // Fallback to local storage
      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId
            ? { ...g, expenses: g.expenses.filter((e) => e.id !== expenseId) }
            : g
        )
      );
    }
  }, []);

  const calculateBalances = useCallback((group: Group): Balance[] => {
    const balanceMap: Record<string, number> = {};

    // Initialize balances for all members
    group.members.forEach((m) => {
      balanceMap[m.id] = 0;
    });

    // Calculate balances from expenses
    group.expenses.forEach((expense) => {
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
  }, []);

  const getGroupTotal = useCallback((group: Group): number => {
    return group.expenses.reduce((sum, e) => sum + e.amount, 0);
  }, []);

  const clearAllData = useCallback(async () => {
    try {
      // Try to clear from API
      for (const group of groups) {
        await apiService.deleteGroup(group.id);
      }
    } catch (error) {
      console.log('API clear failed, clearing local storage only');
    }
    
    // Always clear local storage
    localStorage.removeItem('spliteasy-groups');
    setGroups([]);
    setSelectedGroupId(null);
    console.log('All data cleared');
  }, [groups]);

  return {
    groups,
    selectedGroup,
    selectedGroupId,
    setSelectedGroupId,
    createGroup,
    addMember,
    removeMember,
    addExpense,
    deleteExpense,
    calculateBalances,
    getGroupTotal,
    clearAllData,
    loading,
    syncWithAPI,
  };
}
