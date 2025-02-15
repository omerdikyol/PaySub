import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { ExpenseItem } from '../app/types/expense';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    // If this is a daily summary notification, schedule the next one
    if (notification.request.content.data?.type === 'daily-summary') {
      // Schedule next notification for tomorrow at 12 PM
      const nextNotificationTime = new Date();
      nextNotificationTime.setDate(nextNotificationTime.getDate() + 1);
      nextNotificationTime.setHours(12, 0, 0, 0);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.request.content.title || 'Daily Expense Summary',
          body: notification.request.content.body || '',
          data: { type: 'daily-summary' },
        },
        trigger: nextNotificationTime,
      });
    }

    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    };
  },
});

export class NotificationService {
  static async requestPermissions() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return false;
      }
      return true;
    }

    console.log('Must use physical device for Push Notifications');
    return false;
  }

  static async scheduleExpenseNotification(expense: ExpenseItem) {
    if (!expense.notification?.enabled) return;

    const dueDate = new Date(expense.startDate);
    const notificationDate = new Date(dueDate);
    notificationDate.setDate(dueDate.getDate() - expense.notification.daysInAdvance);
    notificationDate.setHours(expense.notification.time.hour);
    notificationDate.setMinutes(expense.notification.time.minute);
    notificationDate.setSeconds(0);

    // Don't schedule if the notification time is in the past
    if (notificationDate.getTime() <= Date.now()) {
      console.log('Notification time is in the past, skipping scheduling');
      return;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Upcoming Expense Reminder',
        body: `Your expense "${expense.name}" of ${expense.amount} ${expense.currency} is due in ${expense.notification.daysInAdvance} days.`,
        data: { expenseId: expense.id },
      },
      trigger: notificationDate,
    });

    return notificationId;
  }

  static async scheduleDailyExpenseNotifications(expenses: ExpenseItem[]) {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    // Filter expenses created yesterday
    const yesterdayExpenses = expenses.filter(expense => {
      const createdAt = new Date(expense.createdAt || '');
      return createdAt.toDateString() === yesterday.toDateString();
    });

    // Filter unpaid expenses for today
    const todayExpenses = expenses.filter(expense => {
      const startDate = new Date(expense.startDate);
      const isPaid = expense.paymentHistory?.[startDate.toISOString()]?.isPaid;
      return startDate.toDateString() === now.toDateString() && !isPaid;
    });

    // Schedule notification for 12 PM today or tomorrow
    const notificationTime = new Date();
    notificationTime.setHours(12, 0, 0, 0);

    // If it's past 12 PM, schedule for tomorrow
    if (now > notificationTime) {
      notificationTime.setDate(notificationTime.getDate() + 1);
    }

    // Create notification content
    let notificationBody = '';
    
    if (yesterdayExpenses.length > 0) {
      notificationBody += `New expenses from yesterday:\n`;
      yesterdayExpenses.forEach(expense => {
        notificationBody += `- ${expense.name}: ${expense.amount} ${expense.currency}\n`;
      });
    }

    if (todayExpenses.length > 0) {
      if (notificationBody) notificationBody += '\n';
      notificationBody += `Unpaid expenses for today:\n`;
      todayExpenses.forEach(expense => {
        notificationBody += `- ${expense.name}: ${expense.amount} ${expense.currency}\n`;
      });
    }

    if (notificationBody) {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Daily Expense Summary',
          body: notificationBody.trim(),
          data: { type: 'daily-summary' }, // Add this to identify the notification type
        },
        trigger: notificationTime,
      });

      return notificationId;
    }
  }

  static async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  static async setNotificationsEnabled(enabled: boolean) {
    if (!enabled) {
      await this.cancelAllNotifications();
    }
  }
} 