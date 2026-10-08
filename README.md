# PaySub

An Expo/React Native personal-finance app for income, recurring expenses, subscriptions, and payment history. It includes currency selection, Turkish/English text, light/dark appearance, and notification settings.

## Project scope

The mobile app contains direct Firebase authentication and Firestore service flows. The separate `backend` directory is an experimental server implementation with a different, inconsistent persistence path; it is not a supported production authentication backend. Its login/password verification must be corrected before deployment. The screenshots show application UI, not a claim of production readiness.

## Run the mobile app

```sh
git clone https://github.com/omerdikyol/PaySub.git
cd PaySub
npm install
npx expo start
```

Use a Node.js version compatible with the checked-in Expo 52 SDK. Configure your own Firebase project through [app.config.ts](app.config.ts) and [config/firebase.ts](config/firebase.ts), and enable the authentication/database services used by the app. Check the actual Expo configuration mapping rather than assuming arbitrary `.env` names are read automatically. Notification behavior depends on device permissions and the runtime you use.

## Code map

- [app](app): routed screens for income, expenses, home, login, and settings.
- [AuthContext](context/AuthContext.tsx): mobile authentication state.
- [Firebase expense service](services/firebase/expense.service.ts) and [income service](services/firebase/income.service.ts): database operations.
- [NotificationService](services/NotificationService.ts): notification scheduling/integration.
- [Occurrence utilities](utils/occurrences.ts): recurring-payment calculations.
- [backend documentation](backend/README.md): the experimental server layout, separate from the client service path.

## Screenshots

<div style="display: flex; flex-wrap: wrap; gap: 10px;">

### Home Screen

<img src="screenshots/home.png" width="250" alt="Home Screen">

### Income Tracking

<img src="screenshots/income.png" width="250" alt="Finance screen">

### Adding New Income

<img src="screenshots/add-income.png" width="250" alt="Finance screen">

### Expense Tracking

<img src="screenshots/expense.png" width="250" alt="Finance screen">

### Payment History

<img src="screenshots/payment-history.png" width="250" alt="Finance screen">

### Adding New Expense

<img src="screenshots/add-expense.png" width="250" alt="Finance screen">

### Settings

<img src="screenshots/settings.png" width="250" alt="App settings and appearance">

### Dark Mode

<img src="screenshots/dark.png" width="250" alt="App settings and appearance">

### Turkish Language Support

<img src="screenshots/turkish.png" width="250" alt="App settings and appearance">

</div>
