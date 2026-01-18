import mongoose from 'mongoose';

const settlementSchema = new mongoose.Schema({
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR',
    enum: ['INR', 'USD', 'EUR', 'GBP']
  },
  status: {
    type: String,
    enum: ['pending', 'settled'],
    default: 'pending'
  },
  settledAt: {
    type: Date
  },
  settledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

settlementSchema.index({ group: 1 });
settlementSchema.index({ from: 1 });
settlementSchema.index({ to: 1 });
settlementSchema.index({ status: 1 });

settlementSchema.methods.toJSON = function() {
  const settlement = this.toObject();
  delete settlement.__v;
  return settlement;
};

export const Settlement = mongoose.model('Settlement', settlementSchema);
