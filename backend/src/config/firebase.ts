import * as admin from 'firebase-admin';
import path from 'path';

const serviceAccount = require(path.join(__dirname, '../../serviceAccountKey.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'paysub-app',
  databaseURL: `https://paysub-app.firebaseio.com`
});

export const auth = admin.auth();
export const db = admin.firestore();

// Collections
export const collections = {
  users: db.collection('users'),
  expenses: db.collection('expenses'),
  incomes: db.collection('incomes'),
  services: db.collection('services'),
  serviceCategories: db.collection('serviceCategories'),
}; 