import { Request, Response } from 'express';
import { collections } from '../config/firebase';

interface Service {
  id: string;
  name: string;
  logo: string;
  defaultPrice: number;
  defaultCurrency: string;
  category: string;
}

export const getServices = async (req: Request, res: Response) => {
  try {
    const snapshot = await collections.services
      .orderBy('category', 'asc')
      .orderBy('name', 'asc')
      .get();

    const services = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(services);
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getServiceCategories = async (req: Request, res: Response) => {
  try {
    const snapshot = await collections.serviceCategories
      .orderBy('name', 'asc')
      .get();

    const categories = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const categoryData = doc.data();
        const servicesSnapshot = await collections.services
          .where('category', '==', doc.id)
          .get();
        
        const services = servicesSnapshot.docs.map(serviceDoc => ({
          id: serviceDoc.id,
          ...serviceDoc.data()
        }));

        return {
          id: doc.id,
          ...categoryData,
          services
        };
      })
    );

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

    const searchQuery = (query as string).toLowerCase();
    const snapshot = await collections.services.get();
    
    const services = snapshot.docs
      .map(doc => ({
        ...(doc.data() as Service),
        id: doc.id,
        score: 0
      }))
      .filter(service => {
        const nameMatch = service.name.toLowerCase().includes(searchQuery);
        if (nameMatch) service.score += 2;
        const categoryMatch = service.category.toLowerCase().includes(searchQuery);
        if (categoryMatch) service.score += 1;
        return nameMatch || categoryMatch;
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(({ score, ...service }) => service);

    res.json(services);
  } catch (error) {
    console.error('Search services error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getServicesByCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const snapshot = await collections.services
      .where('category', '==', categoryId)
      .orderBy('name', 'asc')
      .get();

    const services = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(services);
  } catch (error) {
    console.error('Get services by category error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}; 