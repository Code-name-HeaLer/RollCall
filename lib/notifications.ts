import { addDays, startOfDay } from 'date-fns';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getAllTasks, getClassesForDayWithAttendance } from './database';

// --- THIS FIXES THE FIRST TYPE ERROR ---
// The handler must return a promise that resolves to an object with these properties.
Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

/**
 * Requests notification permissions from the user.
 */
export async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    if (newStatus !== 'granted') {
      console.log('Notification permissions denied.');
      return false;
    }
  }
  return true;
}

/**
 * This is our new central scheduling function.
 * It clears all old notifications and schedules new ones for the upcoming week.
 */
export async function rescheduleAllNotifications(settings: { classReminders: boolean; taskReminders: boolean }) {
  // 1. Cancel everything that was previously scheduled.
  await Notifications.cancelAllScheduledNotificationsAsync();

  // 2. Schedule class reminders if enabled
  if (settings.classReminders) {
    for (let i = 1; i <= 7; i++) { // Schedule for the next 7 days
      const date = addDays(new Date(), i);
      const dayOfWeek = date.getDay();
      const classes = await getClassesForDayWithAttendance(dayOfWeek);

      if (classes.length > 0) {
        // --- THIS FIXES THE SECOND TYPE ERROR ---
        // The trigger must be a NotificationTriggerInput object, not just a Date.
        const triggerDate = startOfDay(date);
        triggerDate.setHours(7, 0, 0, 0);
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `You have ${classes.length} class${classes.length > 1 ? 'es' : ''} today!`,
            body: `Your first class is ${classes[0].subject_name}.`,
          },
          trigger: triggerDate as unknown as Notifications.NotificationTriggerInput,
        });
      }
    }
    console.log("Scheduled weekly class reminders.");
  }

  // 3. Schedule task reminders if enabled
  if (settings.taskReminders) {
    const tasks = await getAllTasks();
    const today = startOfDay(new Date());

    for (const task of tasks) {
      if (task.is_completed === 0) {
        const dueDate = startOfDay(new Date(task.due_date.replace(/-/g, '/')));
        const notificationDate = addDays(dueDate, -1); // 1 day before

        // Only schedule if the notification date is today or in the future
        if (notificationDate >= today) {
          const triggerDate = new Date(notificationDate);
          triggerDate.setHours(9, 0, 0, 0);
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Task Reminder',
              body: `Your task "${task.title}" is due tomorrow!`,
            },
            trigger: triggerDate as unknown as Notifications.NotificationTriggerInput,
          });
        }
      }
    }
    console.log("Scheduled task deadline reminders.");
  }
}