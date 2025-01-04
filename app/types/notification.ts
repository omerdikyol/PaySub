export type NotificationSettings = {
  enabled: boolean;
  daysInAdvance: number;
  time: {
    hour: number;
    minute: number;
  };
};

export type NotificationPreferences = {
  defaultEnabled: boolean;
  defaultDaysInAdvance: number;
  defaultTime: {
    hour: number;
    minute: number;
  };
}; 