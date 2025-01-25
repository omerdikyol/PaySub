import { Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth';
import { collections } from '../config/firebase';
import { Income } from '../models/Income';

export const getIncomes = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const incomes = await Income.find({ userId, isActive: true });
    res.json(incomes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching incomes', error });
  }
};

export const getIncome = async (req: AuthRequest, res: Response) => {
  try {
    const doc = await collections.incomes.doc(req.params.id).get();

    if (!doc.exists || doc.data()?.userId !== req.user?.id) {
      return res.status(404).json({ error: 'Income not found' });
    }

    res.json({
      id: doc.id,
      ...doc.data()
    });
  } catch (error) {
    console.error('Get income error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const createIncome = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const incomeData = {
      ...req.body,
      userId: req.user?.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await collections.incomes.add(incomeData);
    const doc = await docRef.get();

    res.status(201).json({
      id: doc.id,
      ...doc.data()
    });
  } catch (error) {
    console.error('Create income error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateIncome = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const doc = await collections.incomes.doc(req.params.id).get();
    if (!doc.exists || doc.data()?.userId !== req.user?.id) {
      return res.status(404).json({ error: 'Income not found' });
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    await collections.incomes.doc(req.params.id).update(updateData);
    const updatedDoc = await collections.incomes.doc(req.params.id).get();

    res.json({
      id: updatedDoc.id,
      ...updatedDoc.data()
    });
  } catch (error) {
    console.error('Update income error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteIncome = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const income = await Income.findOneAndUpdate(
      { _id: id, userId },
      { isActive: false },
      { new: true }
    );

    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }

    res.json({ message: 'Income deleted successfully', income });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting income', error });
  }
}; 