import mongoose from 'mongoose';

const splitDetailSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  percentage: {
    type: Number,
    min: 0,
    max: 100
  }
}, { _id: true });

const expenseSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  splitType: {
    type: String,
    required: true,
    enum: ['equal', 'custom'],
    default: 'equal'
  },
  splitBetween: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }],
  customSplits: [splitDetailSchema],
  category: {
    type: String,
    enum: [
      'food', 'transport', 'accommodation', 'entertainment',
      'shopping', 'bills', 'healthcare', 'education', 'other'
    ],
    default: 'other'
  },
  date: {
    type: Date,
    default: Date.now
  },
  receipt: {
    url: String,
    filename: String
  },
  notes: {
    type: String,
    maxlength: 1000
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

expenseSchema.index({ group: 1 });
expenseSchema.index({ paidBy: 1 });
expenseSchema.index({ createdBy: 1 });
expenseSchema.index({ date: -1 });
expenseSchema.index({ category: 1 });

expenseSchema.methods.toJSON = function() {
  const expense = this.toObject();
  delete expense.__v;
  return expense;
};

export const Expense = mongoose.model('Expense', expenseSchema);
