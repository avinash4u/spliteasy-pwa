import { Group, Expense, Member } from '@/types/expense';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// API Service for backend operations
class ApiService {
  private async request(endpoint: string, options: RequestInit = {}) {
    try {
      // Only make API requests if we have a valid URL
      if (!API_URL || API_URL === 'http://localhost:5000/api') {
        throw new Error('API URL not configured');
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Groups
  async getGroups(): Promise<Group[]> {
    try {
      const groups = await this.request('/groups');
      // Convert date strings back to Date objects
      return groups.map((group: any) => ({
        ...group,
        createdAt: new Date(group.createdAt),
        expenses: group.expenses.map((expense: any) => ({
          ...expense,
          createdAt: new Date(expense.createdAt)
        }))
      }));
    } catch (error) {
      console.error('Failed to fetch groups from API:', error);
      throw error; // Let the store handle the fallback
    }
  }

  async createGroup(groupData: Omit<Group, 'id' | 'createdAt'>): Promise<Group> {
    const group = await this.request('/groups', {
      method: 'POST',
      body: JSON.stringify(groupData),
    });
    
    return {
      ...group,
      createdAt: new Date(group.createdAt),
      expenses: group.expenses.map((expense: any) => ({
        ...expense,
        createdAt: new Date(expense.createdAt)
      }))
    };
  }

  async updateGroup(id: string, groupData: Partial<Group>): Promise<Group> {
    const group = await this.request(`/groups/${id}`, {
      method: 'PUT',
      body: JSON.stringify(groupData),
    });
    
    return {
      ...group,
      createdAt: new Date(group.createdAt),
      expenses: group.expenses.map((expense: any) => ({
        ...expense,
        createdAt: new Date(expense.createdAt)
      }))
    };
  }

  async deleteGroup(id: string): Promise<void> {
    await this.request(`/groups/${id}`, {
      method: 'DELETE',
    });
  }

  // Expenses
  async addExpense(groupId: string, expenseData: Omit<Expense, 'id' | 'createdAt' | 'groupId'>): Promise<Expense> {
    const expense = await this.request(`/groups/${groupId}/expenses`, {
      method: 'POST',
      body: JSON.stringify(expenseData),
    });
    
    return {
      ...expense,
      createdAt: new Date(expense.createdAt),
    };
  }

  async deleteExpense(groupId: string, expenseId: string): Promise<void> {
    await this.request(`/groups/${groupId}/expenses/${expenseId}`, {
      method: 'DELETE',
    });
  }

  // Members
  async addMember(groupId: string, memberData: Omit<Member, 'id'>): Promise<Member> {
    const member = await this.request(`/groups/${groupId}/members`, {
      method: 'POST',
      body: JSON.stringify(memberData),
    });
    
    return member;
  }

  async removeMember(groupId: string, memberId: string): Promise<void> {
    await this.request(`/groups/${groupId}/members/${memberId}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();
