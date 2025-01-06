import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { ExpenseItem } from '../app/types/expense';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
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
      trigger: {
        date: notificationDate,
        type: 'date'
      },
    });

    return notificationId;
  }

  // Test function to trigger an immediate notification
  static async testNotification(expense: ExpenseItem) {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Test Notification',
        body: `Test notification for expense "${expense.name}" of ${expense.amount} ${expense.currency}`,
        data: { expenseId: expense.id },
      },
      trigger: null, // null trigger means send immediately
    });

    return notificationId;
  }

  // Test function to trigger a scheduled notification in X minutes
  static async testScheduledNotification(expense: ExpenseItem, minutesFromNow: number) {
    const notificationDate = new Date(Date.now() + minutesFromNow * 60 * 1000);
    
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Scheduled Test Notification',
        body: `Scheduled test notification for expense "${expense.name}" of ${expense.amount} ${expense.currency}`,
        data: { expenseId: expense.id },
      },
      trigger: {
        date: notificationDate,
        type: 'date'
      },
    });

    return notificationId;
  }

  // Function to get all scheduled notifications
  static async getAllScheduledNotifications() {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  // Function to cancel a specific notification
  static async cancelNotification(notificationId: string) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  // Function to cancel all notifications
  static async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  // Function to set notifications enabled state
  static async setNotificationsEnabled(enabled: boolean) {
    if (!enabled) {
      // If notifications are being disabled, cancel all scheduled notifications
      await this.cancelAllNotifications();
    }
  }
} 