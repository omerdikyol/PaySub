import { Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth';
import Income from '../models/Income';

export const getIncomes = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const query: any = { userId: req.user?.id };

    if (startDate && endDate) {
      query.startDate = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    }

    const incomes = await Income.find(query).sort({ startDate: 1 });
    res.json(incomes);
  } catch (error) {
    console.error('Get incomes error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getIncome = async (req: AuthRequest, res: Response) => {
  try {
    const income = await Income.findOne({
      _id: req.params.id,
      userId: req.user?.id,
    });

    if (!income) {
      return res.status(404).json({ error: 'Income not found' });
    }

    res.json(income);
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

    const income = new Income({
      ...req.body,
      userId: req.user?.id,
    });

    await income.save();
    res.status(201).json(income);
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

    const income = await Income.findOneAndUpdate(
      { _id: req.params.id, userId: req.user?.id },
      { $set: req.body },
      { new: true }
    );

    if (!income) {
      return res.status(404).json({ error: 'Income not found' });
    }

    res.json(income);
  } catch (error) {
    console.error('Update income error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteIncome = async (req: AuthRequest, res: Response) => {
  try {
    const income = await Income.findOneAndDelete({
      _id: req.params.id,
      userId: req.user?.id,
    });

    if (!income) {
      return res.status(404).json({ error: 'Income not found' });
    }

    res.json({ message: 'Income deleted' });
  } catch (error) {
    console.error('Delete income error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}; 