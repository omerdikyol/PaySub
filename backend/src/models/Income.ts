import mongoose, { Schema, Document } from 'mongoose';

export interface IIncome extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  name: string;
  startDate: Date;
  color: string;
  recurrence: {
    type: 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
    interval?: number;
    endDate?: Date;
    intervalUnit?: 'day' | 'month';
  };
  isActive: boolean;
}

const IncomeSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  recurrence: {
    type: {
      type: String,
      required: true,
      enum: ['once', 'daily', 'weekly', 'monthly', 'yearly', 'custom'],
    },
    interval: Number,
    endDate: Date,
    intervalUnit: {
      type: String,
      enum: ['day', 'month'],
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
IncomeSchema.index({ userId: 1, startDate: 1 });

export default mongoose.model<IIncome>('Income', IncomeSchema); 