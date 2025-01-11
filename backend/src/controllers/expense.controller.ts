import { Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth';
import { collections } from '../config/firebase';

export const getExpenses = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { startDate, endDate } = req.query;
    
    // First, get all expenses for this user to check the data structure
    const baseQuery = collections.expenses.where('userId', '==', req.user.id);
    const baseSnapshot = await baseQuery.get();
    
    console.log('All expenses for user:', baseSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })));

    let query = collections.expenses.where('userId', '==', req.user.id);

    if (startDate && endDate) {
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      
      console.log('Filtering by date range:', {
        start: start.toISOString(),
        end: end.toISOString()
      });

      // Add all where clauses before orderBy
      query = query
        .where('startDate', '>=', start)
        .where('startDate', '<=', end)
        .orderBy('startDate', 'asc');
    } else {
      // If no date range, just order by startDate
      query = query.orderBy('startDate', 'asc');
    }

    console.log('Query params:', {
      userId: req.user.id,
      startDate: startDate ? new Date(startDate as string) : null,
      endDate: endDate ? new Date(endDate as string) : null
    });

    const snapshot = await query.get();
    const expenses = snapshot.docs.map(doc => {
      const data = doc.data();
      console.log('Expense data:', {
        id: doc.id,
        startDate: data.startDate,
        userId: data.userId,
        ...data
      });
      return {
        id: doc.id,
        ...data
      };
    });

    console.log('Found expenses:', expenses.length);
    res.json(expenses);
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ error: 'Server error' });
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
    const doc = await collections.expenses.doc(req.params.id).get();
    if (!doc.exists || doc.data()?.userId !== req.user?.id) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    await collections.expenses.doc(req.params.id).delete();
    res.json({ message: 'Expense deleted' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ error: 'Server error' });
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