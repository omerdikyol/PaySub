import { Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth';
import { collections } from '../config/firebase';
import { Expense } from '../models/Expense';

export const getExpenses = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const expenses = await Expense.find({ userId, isActive: true });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching expenses', error });
  }
};

export const getExpense = async (req: AuthRequest, res: Response) => {
  try {
    const doc = await collections.expenses.doc(req.params.id).get();

    if (!doc.exists || doc.data()?.userId !== req.user?.id) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json({
      id: doc.id,
      ...doc.data()
    });
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

    if (!req.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Convert date strings to Date objects
    const expenseData = {
      ...req.body,
      userId: req.user.id,
      startDate: req.body.startDate ? new Date(req.body.startDate) : new Date(),
      endDate: req.body.endDate ? new Date(req.body.endDate) : null,
      paymentHistory: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log('Creating expense:', expenseData);

    const docRef = await collections.expenses.add(expenseData);
    const doc = await docRef.get();
    const createdExpense = {
      id: doc.id,
      ...doc.data()
    };

    console.log('Created expense:', createdExpense);
    res.status(201).json(createdExpense);
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

    const doc = await collections.expenses.doc(req.params.id).get();
    if (!doc.exists || doc.data()?.userId !== req.user?.id) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    await collections.expenses.doc(req.params.id).update(updateData);
    const updatedDoc = await collections.expenses.doc(req.params.id).get();

    res.json({
      id: updatedDoc.id,
      ...updatedDoc.data()
    });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteExpense = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const expense = await Expense.findOneAndUpdate(
      { _id: id, userId },
      { isActive: false },
      { new: true }
    );

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted successfully', expense });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting expense', error });
  }
};

export const updatePaymentStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { date, isPaid } = req.body;
    
    const doc = await collections.expenses.doc(req.params.id).get();
    if (!doc.exists || doc.data()?.userId !== req.user?.id) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    const expenseData = doc.data();
    if (!expenseData) {
      return res.status(404).json({ error: 'Expense data not found' });
    }

    const newPaymentHistory = {
      ...expenseData.paymentHistory,
      [date]: {
        isPaid,
        paidDate: isPaid ? new Date() : null
      }
    };

    await collections.expenses.doc(req.params.id).update({
      paymentHistory: newPaymentHistory,
      updatedAt: new Date()
    });

    const updatedDoc = await collections.expenses.doc(req.params.id).get();
    res.json({
      id: updatedDoc.id,
      ...updatedDoc.data()
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}; 