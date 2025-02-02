import { Schema, model, Document } from 'mongoose';

export interface IPaymentHistory extends Document {
  expenseId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  previousAmount: number;
  newAmount: number;
  currency: string;
  isPaid?: boolean;
  paidAmount?: number;
  paidDate?: Date;
  effectiveDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentHistorySchema = new Schema<IPaymentHistory>(
  {
    expenseId: { type: Schema.Types.ObjectId, ref: 'Expense', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    previousAmount: { type: Number, required: true },
    newAmount: { type: Number, required: true },
    currency: { type: String, required: true },
    isPaid: { type: Boolean },
    paidAmount: { type: Number },
    paidDate: { type: Date },
    effectiveDate: { type: Date, required: true }
  },
  { timestamps: true }
);

// Create indexes for efficient querying
PaymentHistorySchema.index({ expenseId: 1, effectiveDate: -1 });
PaymentHistorySchema.index({ userId: 1 });

export default model<IPaymentHistory>('PaymentHistory', PaymentHistorySchema);
