import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { auth, collections } from '../config/firebase';
import { AuthRequest } from '../middleware/auth';

export const register = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name, defaultCurrency, language } = req.body;

    // Check if user already exists
    const userRecord = await auth.getUserByEmail(email).catch(() => null);
    if (userRecord) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create user in Firebase Auth
    const createdUser = await auth.createUser({
      email,
      password,
      displayName: name,
    });

    // Create user document in Firestore
    const userData = {
      email,
      name,
      defaultCurrency: defaultCurrency || 'TRY',
      language: language || 'en',
      notificationPreferences: {
        defaultEnabled: true,
        defaultDaysInAdvance: 1,
        defaultTime: {
          hour: 12,
          minute: 0,
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await collections.users.doc(createdUser.uid).set(userData);

    // Create custom token
    const token = await auth.createCustomToken(createdUser.uid);

    res.status(201).json({
      token,
      user: {
        id: createdUser.uid,
        ...userData,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Get user from Firebase Auth
    const userRecord = await auth.getUserByEmail(email).catch(() => null);
    if (!userRecord) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Get user data from Firestore
    const userDoc = await collections.users.doc(userRecord.uid).get();
    if (!userDoc.exists) {
      return res.status(400).json({ error: 'User data not found' });
    }

    // Create custom token
    const token = await auth.createCustomToken(userRecord.uid);

    res.json({
      token,
      user: {
        id: userRecord.uid,
        ...userDoc.data(),
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userDoc = await collections.users.doc(req.user.id).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: userDoc.id,
      ...userDoc.data(),
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { name, defaultCurrency, language, notificationPreferences } = req.body;

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name) {
      updateData.name = name;
      // Update display name in Firebase Auth
      await auth.updateUser(req.user.id, { displayName: name });
    }
    if (defaultCurrency) updateData.defaultCurrency = defaultCurrency;
    if (language) updateData.language = language;
    if (notificationPreferences) updateData.notificationPreferences = notificationPreferences;

    await collections.users.doc(req.user.id).update(updateData);

    const userDoc = await collections.users.doc(req.user.id).get();
    res.json({
      id: userDoc.id,
      ...userDoc.data(),
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}; 