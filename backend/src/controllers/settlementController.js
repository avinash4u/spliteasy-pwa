import { Expense } from '../models/Expense.js';
import { Group } from '../models/Group.js';
import { Settlement } from '../models/Settlement.js';
import { User } from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const calculateBalances = (expenses, groupMembers) => {
  const balanceMap = {};

  groupMembers.forEach(member => {
    balanceMap[member.user.toString()] = 0;
  });

  expenses.forEach(expense => {
    const payerId = expense.paidBy._id.toString();
    
    if (expense.splitType === 'equal') {
      const splitAmount = expense.amount / expense.splitBetween.length;
      
      balanceMap[payerId] += expense.amount;
      
      expense.splitBetween.forEach(split => {
        const userId = split.user._id.toString();
        balanceMap[userId] -= splitAmount;
      });
    } else if (expense.splitType === 'custom') {
      balanceMap[payerId] += expense.amount;
      
      expense.customSplits.forEach(customSplit => {
        const userId = customSplit.user._id.toString();
        balanceMap[userId] -= customSplit.amount;
      });
    }
  });

  const balances = [];
  const creditors = [];
  const debtors = [];

  Object.keys(balanceMap).forEach(userId => {
    const amount = balanceMap[userId];
    if (amount > 0.01) {
      creditors.push({ userId, amount });
    } else if (amount < -0.01) {
      debtors.push({ userId, amount: Math.abs(amount) });
    }
  });

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  let creditorIndex = 0;
  let debtorIndex = 0;

  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex];
    const debtor = debtors[debtorIndex];

    const settleAmount = Math.min(creditor.amount, debtor.amount);

    if (settleAmount > 0.01) {
      balances.push({
        from: debtor.userId,
        to: creditor.userId,
        amount: Math.round(settleAmount * 100) / 100
      });

      creditors[creditorIndex].amount -= settleAmount;
      debtors[debtorIndex].amount -= settleAmount;

      if (creditors[creditorIndex].amount <= 0.01) {
        creditorIndex++;
      }
      if (debtors[debtorIndex].amount <= 0.01) {
        debtorIndex++;
      }
    }
  }

  return balances;
};

export const getGroupSettlements = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const currentUser = await User.findOne({ uid: req.user.uid });

  if (!currentUser) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const group = await Group.findOne({
    _id: groupId,
    'members.user': currentUser._id,
    isActive: true
  })
  .populate('members.user', 'name email photoURL');

  if (!group) {
    return res.status(404).json({
      success: false,
      message: 'Group not found or access denied'
    });
  }

  const expenses = await Expense.find({ group: groupId })
    .populate('paidBy', 'name email photoURL')
    .populate('splitBetween.user', 'name email photoURL')
    .populate('customSplits.user', 'name email photoURL')
    .sort({ date: -1 });

  const balances = calculateBalances(expenses, group.members);

  const balanceDetails = balances.map(balance => {
    const fromUser = group.members.find(
      member => member.user._id.toString() === balance.from
    );
    const toUser = group.members.find(
      member => member.user._id.toString() === balance.to
    );

    return {
      from: {
        _id: fromUser.user._id,
        name: fromUser.user.name,
        email: fromUser.user.email,
        photoURL: fromUser.user.photoURL
      },
      to: {
        _id: toUser.user._id,
        name: toUser.user.name,
        email: toUser.user.email,
        photoURL: toUser.user.photoURL
      },
      amount: balance.amount
    };
  });

  const memberBalances = {};
  group.members.forEach(member => {
    memberBalances[member.user._id.toString()] = {
      user: {
        _id: member.user._id,
        name: member.user.name,
        email: member.user.email,
        photoURL: member.user.photoURL
      },
      totalOwed: 0,
      totalToReceive: 0,
      netBalance: 0
    };
  });

  balanceDetails.forEach(balance => {
    memberBalances[balance.from._id.toString()].totalOwed += balance.amount;
    memberBalances[balance.from._id.toString()].netBalance -= balance.amount;
    
    memberBalances[balance.to._id.toString()].totalToReceive += balance.amount;
    memberBalances[balance.to._id.toString()].netBalance += balance.amount;
  });

  const summary = {
    totalExpenses: expenses.length,
    totalAmount: expenses.reduce((sum, expense) => sum + expense.amount, 0),
    currency: group.currency,
    memberCount: group.members.length,
    settlements: balanceDetails,
    memberBalances: Object.values(memberBalances)
  };

  res.status(200).json({
    success: true,
    data: summary
  });
});

export const recordSettlement = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { from, to, amount, notes } = req.body;
  const currentUser = await User.findOne({ uid: req.user.uid });

  if (!currentUser) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const group = await Group.findOne({
    _id: groupId,
    'members.user': currentUser._id,
    isActive: true
  });

  if (!group) {
    return res.status(404).json({
      success: false,
      message: 'Group not found or access denied'
    });
  }

  const fromUser = await User.findById(from);
  const toUser = await User.findById(to);

  if (!fromUser || !toUser) {
    return res.status(400).json({
      success: false,
      message: 'Invalid users specified'
    });
  }

  const settlement = await Settlement.create({
    group: groupId,
    from,
    to,
    amount,
    currency: group.currency,
    status: 'settled',
    settledAt: new Date(),
    settledBy: currentUser._id,
    notes
  });

  await settlement.populate([
    { path: 'from', select: 'name email photoURL' },
    { path: 'to', select: 'name email photoURL' },
    { path: 'settledBy', select: 'name email photoURL' }
  ]);

  res.status(201).json({
    success: true,
    message: 'Settlement recorded successfully',
    data: settlement
  });
});

export const getSettlementHistory = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const currentUser = await User.findOne({ uid: req.user.uid });

  if (!currentUser) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const group = await Group.findOne({
    _id: groupId,
    'members.user': currentUser._id,
    isActive: true
  });

  if (!group) {
    return res.status(404).json({
      success: false,
      message: 'Group not found or access denied'
    });
  }

  const settlements = await Settlement.find({ group: groupId })
    .populate('from', 'name email photoURL')
    .populate('to', 'name email photoURL')
    .populate('settledBy', 'name email photoURL')
    .sort({ settledAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Settlement.countDocuments({ group: groupId });

  res.status(200).json({
    success: true,
    data: {
      settlements,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});
