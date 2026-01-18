export interface Member {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  splitBetween: string[];
  splitType: 'equal' | 'custom';
  customSplits?: Record<string, number>;
  createdAt: Date;
  groupId: string;
}

export interface Group {
  id: string;
  name: string;
  members: Member[];
  expenses: Expense[];
  createdAt: Date;
}

export interface Balance {
  from: string;
  to: string;
  amount: number;
}
