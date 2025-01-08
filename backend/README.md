# PaySub Backend

This is the backend service for the PaySub application, a subscription and expense tracking system.

## Features

- User authentication and authorization
- Expense management
- Income management
- Subscription service management
- Payment history tracking
- Multi-currency support
- Notification settings

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Setup

1. Clone the repository and navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your environment variables:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/paysub
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

5. Build the TypeScript code:
```bash
npm run build
```

6. Start the development server:
```bash
npm run dev
```

The server will start on http://localhost:3000 (or the port specified in your .env file).

## API Documentation

### Authentication Endpoints

- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/profile` - Get user profile
- PUT `/api/auth/profile` - Update user profile

### Expense Endpoints

- GET `/api/expenses` - Get all expenses
- GET `/api/expenses/:id` - Get single expense
- POST `/api/expenses` - Create expense
- PUT `/api/expenses/:id` - Update expense
- DELETE `/api/expenses/:id` - Delete expense
- PATCH `/api/expenses/:id/payment` - Update payment status

### Income Endpoints

- GET `/api/incomes` - Get all incomes
- GET `/api/incomes/:id` - Get single income
- POST `/api/incomes` - Create income
- PUT `/api/incomes/:id` - Update income
- DELETE `/api/incomes/:id` - Delete income

### Service Endpoints

- GET `/api/services` - Get all services
- GET `/api/services/categories` - Get all service categories
- GET `/api/services/search` - Search services
- GET `/api/services/category/:categoryId` - Get services by category

## Development

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run linter
- `npm test` - Run tests

## Error Handling

The API uses standard HTTP status codes:

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Server Error

## Security

- JWT authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet security headers

## License

MIT 