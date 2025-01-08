import { Request, Response } from 'express';
import { Service, ServiceCategory } from '../models/Service';

export const getServices = async (req: Request, res: Response) => {
  try {
    const services = await Service.find().sort({ category: 1, name: 1 });
    res.json(services);
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getServiceCategories = async (req: Request, res: Response) => {
  try {
    const categories = await ServiceCategory.find()
      .populate('services')
      .sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    console.error('Get service categories error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const searchServices = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const services = await Service.find(
      { $text: { $search: query as string } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(10);

    res.json(services);
  } catch (error) {
    console.error('Search services error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getServicesByCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const services = await Service.find({ category: categoryId }).sort({ name: 1 });
    res.json(services);
  } catch (error) {
    console.error('Get services by category error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}; 