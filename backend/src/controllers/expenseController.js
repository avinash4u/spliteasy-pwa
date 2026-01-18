import { Expense } from '../models/Expense.js';
import { Group } from '../models/Group.js';
import { User } from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const createExpense = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const {
    description,
    amount,
    paidBy,
    splitType,
    splitBetween,
    customSplits,
    category,
    date,
    notes
  } = req.body;

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

  const payerUser = await User.findOne({ _id: paidBy });

  if (!payerUser) {
    return res.status(400).json({
      success: false,
      message: 'Payer not found'
    });
  }

  const isPayerMember = group.members.some(
    member => member.user.toString() === paidBy
  );

  if (!isPayerMember) {
    return res.status(400).json({
      success: false,
      message: 'Payer is not a member of this group'
    });
  }

  for (const splitUser of splitBetween) {
    const isMember = group.members.some(
      member => member.user.toString() === splitUser.user
    );

    if (!isMember) {
      return res.status(400).json({
        success: false,
        message: 'One or more split users are not members of this group'
      });
    }
  }

  if (splitType === 'custom' && customSplits) {
    const totalCustomAmount = customSplits.reduce((sum, split) => sum + split.amount, 0);
    if (Math.abs(totalCustomAmount - amount) > 0.01) {
      return res.status(400).json({
        success: false,
        message: 'Custom split amounts must equal the total expense amount'
      });
    }
  }

  const expense = await Expense.create({
    description,
    amount,
    paidBy,
    group: groupId,
    splitType: splitType || 'equal',
    splitBetween,
    customSplits: splitType === 'custom' ? customSplits : [],
    category: category || 'other',
    date: date ? new Date(date) : new Date(),
    notes,
    createdBy: currentUser._id
  });

  await expense.populate([
    { path: 'paidBy', select: 'name email photoURL' },
    { path: 'group', select: 'name currency' },
    { path: 'splitBetween.user', select: 'name email photoURL' },
    { path: 'customSplits.user', select: 'name email photoURL' },
    { path: 'createdBy', select: 'name email photoURL' }
  ]);

  res.status(201).json({
    success: true,
    message: 'Expense created successfully',
    data: expense
  });
});

export const getGroupExpenses = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { page = 1, limit = 20, category, startDate, endDate } = req.query;

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

  const filter = { group: groupId };

  if (category) {
    filter.category = category;
  }

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  const expenses = await Expense.find(filter)
    .populate('paidBy', 'name email photoURL')
    .populate('splitBetween.user', 'name email photoURL')
    .populate('customSplits.user', 'name email photoURL')
    .populate('createdBy', 'name email photoURL')
    .sort({ date: -1, createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Expense.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: {
      expenses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

export const getExpenseById = asyncHandler(async (req, res) => {
  const { expenseId } = req.params;
  const currentUser = await User.findOne({ uid: req.user.uid });

  if (!currentUser) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const expense = await Expense.findById(expenseId)
    .populate('paidBy', 'name email photoURL')
    .populate('group', 'name members')
    .populate('splitBetween.user', 'name email photoURL')
    .populate('customSplits.user', 'name email photoURL')
    .populate('createdBy', 'name email photoURL');

  if (!expense) {
    return res.status(404).json({
      success: false,
      message: 'Expense not found'
    });
  }

  const group = await Group.findById(expense.group._id);
  const isMember = group.members.some(
    member => member.user.toString() === currentUser._id.toString()
  );

  if (!isMember) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  res.status(200).json({
    success: true,
    data: expense
  });
});

export const updateExpense = asyncHandler(async (req, res) => {
  const { expenseId } = req.params;
  const {
    description,
    amount,
    paidBy,
    splitType,
    splitBetween,
    customSplits,
    category,
    date,
    notes
  } = req.body;

  const currentUser = await User.findOne({ uid: req.user.uid });

  if (!currentUser) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const expense = await Expense.findById(expenseId).populate('group');

  if (!expense) {
    return res.status(404).json({
      success: false,
      message: 'Expense not found'
    });
  }

  if (expense.createdBy.toString() !== currentUser._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Only the expense creator can update it'
    });
  }

  const group = await Group.findById(expense.group._id);

  if (paidBy) {
    const payerUser = await User.findOne({ _id: paidBy });
    if (!payerUser) {
      return res.status(400).json({
        success: false,
        message: 'Payer not found'
      });
    }

    const isPayerMember = group.members.some(
      member => member.user.toString() === paidBy
    );

    if (!isPayerMember) {
      return res.status(400).json({
        success: false,
        message: 'Payer is not a member of this group'
      });
    }
  }

  if (splitBetween) {
    for (const splitUser of splitBetween) {
      const isMember = group.members.some(
        member => member.user.toString() === splitUser.user
      );

      if (!isMember) {
        return res.status(400).json({
          success: false,
          message: 'One or more split users are not members of this group'
        });
      }
    }
  }

  if (splitType === 'custom' && customSplits && amount) {
    const totalCustomAmount = customSplits.reduce((sum, split) => sum + split.amount, 0);
    if (Math.abs(totalCustomAmount - amount) > 0.01) {
      return res.status(400).json({
        success: false,
        message: 'Custom split amounts must equal the total expense amount'
      });
    }
  }

  const updatedExpense = await Expense.findByIdAndUpdate(
    expenseId,
    {
      ...(description && { description }),
      ...(amount && { amount }),
      ...(paidBy && { paidBy }),
      ...(splitType && { splitType }),
      ...(splitBetween && { splitBetween }),
      ...(customSplits && { customSplits }),
      ...(category && { category }),
      ...(date && { date: new Date(date) }),
      ...(notes !== undefined && { notes })
    },
    { new: true, runValidators: true }
  )
  .populate('paidBy', 'name email photoURL')
  .populate('splitBetween.user', 'name email photoURL')
  .populate('customSplits.user', 'name email photoURL')
  .populate('createdBy', 'name email photoURL');

  res.status(200).json({
    success: true,
    message: 'Expense updated successfully',
    data: updatedExpense
  });
});

export const deleteExpense = asyncHandler(async (req, res) => {
  const { expenseId } = req.params;
  const currentUser = await User.findOne({ uid: req.user.uid });

  if (!currentUser) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const expense = await Expense.findById(expenseId);

  if (!expense) {
    return res.status(404).json({
      success: false,
      message: 'Expense not found'
    });
  }

  if (expense.createdBy.toString() !== currentUser._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Only the expense creator can delete it'
    });
  }

  await Expense.findByIdAndDelete(expenseId);

  res.status(200).json({
    success: true,
    message: 'Expense deleted successfully'
  });
});
