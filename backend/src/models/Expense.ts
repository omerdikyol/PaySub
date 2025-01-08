import mongoose, { Schema, Document } from 'mongoose';

export interface IExpense extends Document {
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
  notification?: {
    enabled: boolean;
    daysInAdvance: number;
    time: {
      hour: number;
      minute: number;
    };
  };
  paymentHistory: {
    [key: string]: {
      isPaid: boolean;
      paidDate?: Date;
    };
  };
  service?: {
    id: string;
    name: string;
    logo: string;
    customName?: string;
  };
}

const ExpenseSchema: Schema = new Schema({
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
  notification: {
    enabled: {
      type: Boolean,
      default: true,
    },
    daysInAdvance: {
      type: Number,
      default: 1,
    },
    time: {
      hour: {
        type: Number,
        default: 12,
      },
      minute: {
        type: Number,
        default: 0,
      },
    },
  },
  paymentHistory: {
    type: Object,
    default: {},
  },
  service: {
    id: String,
    name: String,
    logo: String,
    customName: String,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
ExpenseSchema.index({ userId: 1, startDate: 1 });
ExpenseSchema.index({ userId: 1, 'service.id': 1 });

export default mongoose.model<IExpense>('Expense', ExpenseSchema); 