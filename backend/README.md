
# PaySub Backend

A Node.js/Express backend for the PaySub application, using Firebase for authentication and data storage.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a Firebase project and get your service account key:

   - Go to Firebase Console (https://console.firebase.google.com)
   - Create a new project or select existing one
   - Go to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file as `serviceAccountKey.json` in the backend root directory
3. Create `.env` file in the root directory with the following variables:

```env
PORT=3000
NODE_ENV=development
```

4. Create required indexes in Firebase Console:

   - For expenses collection:
     - Composite index on fields: `userId` (Ascending), `startDate` (Ascending)
   - For incomes collection:
     - Composite index on fields: `userId` (Ascending), `startDate` (Ascending)
5. Run the development server:

```bash
npm run dev
```

## API Documentation

### Authentication Endpoints

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "defaultCurrency": "USD",
  "language": "en"
}
```

#### Login User

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get User Profile

```http
GET /api/auth/profile
Authorization: Bearer <token>
```

#### Update User Profile

```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "defaultCurrency": "EUR",
  "language": "en",
  "notificationPreferences": {
    "defaultEnabled": true,
    "defaultDaysInAdvance": 1,
    "defaultTime": {
      "hour": 12,
      "minute": 0
    }
  }
}
```

### Expense Endpoints

#### Create Expense

```http
POST /api/expenses
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Netflix Subscription",
  "amount": 15.99,
  "currency": "USD",
  "category": "streaming",
  "startDate": "2024-01-15",
  "endDate": "2024-12-31",
  "billingPeriod": "MONTHLY"
}
```

#### Get All Expenses

```http
GET /api/expenses
Authorization: Bearer <token>

# Optional query parameters:
?startDate=2024-01-01&endDate=2024-12-31
```

#### Get Single Expense

```http
GET /api/expenses/:id
Authorization: Bearer <token>
```

#### Update Expense

```http
PUT /api/expenses/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Netflix Subscription",
  "amount": 19.99
}
```

#### Update Payment Status

```http
PUT /api/expenses/:id/payment-status
Authorization: Bearer <token>
Content-Type: application/json

{
  "date": "2024-01-15",
  "isPaid": true
}
```

#### Delete Expense

```http
DELETE /api/expenses/:id
Authorization: Bearer <token>
```

### Income Endpoints

#### Create Income

```http
POST /api/incomes
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Salary",
  "amount": 5000,
  "currency": "USD",
  "category": "salary",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "receivingPeriod": "MONTHLY"
}
```

#### Get All Incomes

```http
GET /api/incomes
Authorization: Bearer <token>

# Optional query parameters:
?startDate=2024-01-01&endDate=2024-12-31
```

#### Get Single Income

```http
GET /api/incomes/:id
Authorization: Bearer <token>
```

#### Update Income

```http
PUT /api/incomes/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Salary",
  "amount": 5500
}
```

#### Delete Income

```http
DELETE /api/incomes/:id
Authorization: Bearer <token>
```

### Service Endpoints

#### Get All Services

```http
GET /api/services
```

#### Get Service Categories

```http
GET /api/services/categories
```

#### Search Services

```http
GET /api/services/search?query=netflix
```

#### Get Services by Category

```http
GET /api/services/category/:categoryId
```

## Development

### Available Scripts

- `npm run dev`: Start development server with hot reload
- `npm run build`: Build TypeScript code
- `npm start`: Start production server
- `npm run seed`: Seed the database with initial services and categories

### Project Structure

```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Custom middleware
│   ├── routes/         # API routes
│   ├── scripts/        # Utility scripts
│   └── server.ts       # Server entry point
├── .env                # Environment variables
├── .gitignore         # Git ignore rules
├── package.json       # Project dependencies
└── tsconfig.json     # TypeScript configuration
```

## Error Handling

The API uses standard HTTP status codes:

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Server Error

Error responses follow this format:

```json
{
  "error": "Error message here"
}
```

## Authentication

The API uses Firebase Authentication. All protected endpoints require a valid token in the Authorization header:

```
Authorization: Bearer <token>
```

The token is obtained from the login/register endpoints and should be included in all subsequent requests to protected endpoints.
