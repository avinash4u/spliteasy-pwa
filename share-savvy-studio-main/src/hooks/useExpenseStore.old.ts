import { useState, useCallback, useEffect } from 'react';
import { Group, Expense, Member, Balance } from '@/types/expense';

// Generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 11);

// Load data from localStorage
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

// Save data to localStorage
const saveGroupsToStorage = (groups: Group[]) => {
  try {
    localStorage.setItem('spliteasy-groups', JSON.stringify(groups));
  } catch (error) {
    console.error('Error saving groups to storage:', error);
  }
};

export function useExpenseStore() {
  const [groups, setGroups] = useState<Group[]>(loadGroupsFromStorage());
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const selectedGroup = groups.find((g) => g.id === selectedGroupId) || null;

  // Save to localStorage whenever groups change
  useEffect(() => {
    saveGroupsToStorage(groups);
  }, [groups]);

  const createGroup = useCallback((name: string, members: Omit<Member, 'id'>[]) => {
    const newGroup: Group = {
      id: generateId(),
      name,
      members: members.map((m) => ({ ...m, id: generateId() })),
      expenses: [],
      createdAt: new Date(),
    };
    setGroups((prev) => [...prev, newGroup]);
    setSelectedGroupId(newGroup.id);
    console.log('Group created:', newGroup.name);
    return newGroup;
  }, []);

  const addMember = useCallback((groupId: string, member: Omit<Member, 'id'>) => {
    const newMember = { ...member, id: generateId() };
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId ? { ...g, members: [...g.members, newMember] } : g
      )
    );
    console.log('Member added:', newMember.name);
    return newMember;
  }, []);

  const removeMember = useCallback((groupId: string, memberId: string) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, members: g.members.filter((m) => m.id !== memberId) }
          : g
      )
    );
  }, []);

  const addExpense = useCallback(
    (
      groupId: string,
      expense: Omit<Expense, 'id' | 'createdAt' | 'groupId'>
    ) => {
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
      console.log('Expense added:', newExpense.description);
      return newExpense;
    },
    []
  );

  const deleteExpense = useCallback((groupId: string, expenseId: string) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, expenses: g.expenses.filter((e) => e.id !== expenseId) }
          : g
      )
    );
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

  const clearAllData = useCallback(() => {
    localStorage.removeItem('spliteasy-groups');
    setGroups([]);
    setSelectedGroupId(null);
    console.log('All data cleared');
  }, []);

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
  };
}
