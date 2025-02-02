import { PaymentHistory, IPaymentHistory } from '../models/PaymentHistory';
import { Types } from 'mongoose';

export class PaymentHistoryService {
  static async createPaymentHistory(data: {
    expenseId: Types.ObjectId;
    userId: Types.ObjectId;
    previousAmount: number;
    newAmount: number;
    currency: string;
    effectiveDate: Date;
  }): Promise<IPaymentHistory> {
    const paymentHistory = new PaymentHistory({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return await paymentHistory.save();
  }

  static async getPaymentHistoriesForExpense(expenseId: Types.ObjectId): Promise<IPaymentHistory[]> {
    return await PaymentHistory.find({ expenseId })
      .sort({ effectiveDate: -1 })
      .exec();
  }

  static async getPaymentHistoriesForExpenses(expenseIds: Types.ObjectId[]): Promise<IPaymentHistory[]> {
    return await PaymentHistory.find({
      expenseId: { $in: expenseIds }
    })
      .sort({ effectiveDate: -1 })
      .exec();
  }

  static async getEffectiveAmount(expenseId: Types.ObjectId, date: Date): Promise<number | null> {
    const paymentHistory = await PaymentHistory.findOne({
      expenseId,
      effectiveDate: { $lte: date }
    })
      .sort({ effectiveDate: -1 })
      .exec();

    return paymentHistory ? paymentHistory.newAmount : null;
  }
} 