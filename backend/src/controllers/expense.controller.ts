import { Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth';
import Expense from '../models/Expense';

export const getExpenses = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const query: any = { userId: req.user?.id };

    if (startDate && endDate) {
      query.startDate = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    }

    const expenses = await Expense.find(query).sort({ startDate: 1 });
    res.json(expenses);
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getExpense = async (req: AuthRequest, res: Response) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.user?.id,
    });

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json(expense);
  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const createExpense = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const expense = new Expense({
      ...req.body,
      userId: req.user?.id,
      paymentHistory: {},
    });

    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateExpense = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user?.id },
      { $set: req.body },
      { new: true }
    );

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json(expense);
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteExpense = async (req: AuthRequest, res: Response) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.user?.id,
    });

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updatePaymentStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { date, isPaid } = req.body;
    
    // First get the current expense
    const expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.user?.id,
    });

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    // Create a new payment history object
    const newPaymentHistory = {
      ...expense.paymentHistory,
      [date]: {
        isPaid,
        paidDate: isPaid ? new Date() : null
      }
    };

    // Update the expense with the new payment history
    const updatedExpense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user?.id },
      { $set: { paymentHistory: newPaymentHistory } },
      { new: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json(updatedExpense);
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}; 