import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { ThemedText, ThemedView, ThemedButton } from './Themed';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Switch } from 'react-native';
import { useTheme } from './useTheme';
import { NotificationSettings as NotificationSettingsType } from '@/app/types/notification';

interface NotificationSettingsProps {
  value: NotificationSettingsType;
  onChange: (settings: NotificationSettingsType) => void;
}

export function NotificationSettings({ value, onChange }: NotificationSettingsProps) {
  const { colors } = useTheme();
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleTimeChange = (date: Date) => {
    onChange({
      ...value,
      time: {
        hour: date.getHours(),
        minute: date.getMinutes()
      }
    });
    setShowTimePicker(false);
  };

  const formatTime = (hour: number, minute: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.label}>Notifications</ThemedText>
      
      <View style={styles.row}>
        <ThemedText>Enable notifications</ThemedText>
        <Switch
          value={value.enabled}
          onValueChange={(enabled) => onChange({ ...value, enabled })}
          trackColor={{ false: '#767577', true: colors.secondary }}
          thumbColor="#f4f3f4"
        />
      </View>

      {value.enabled && (
        <>
          <View style={styles.row}>
            <ThemedText>Days in advance</ThemedText>
            <View style={styles.daysContainer}>
              {[1, 3, 5, 7].map((days) => (
                <ThemedButton
                  key={days}
                  style={[
                    styles.dayButton,
                    value.daysInAdvance === days && styles.selectedDayButton
                  ]}
                  onPress={() => onChange({ ...value, daysInAdvance: days })}
                >
                  {days}
                </ThemedButton>
              ))}
            </View>
          </View>

          <View style={styles.row}>
            <ThemedText>Notification time</ThemedText>
            <ThemedButton
              style={styles.timeButton}
              onPress={() => setShowTimePicker(true)}
            >
              {formatTime(value.time.hour, value.time.minute)}
            </ThemedButton>
          </View>

          <DateTimePickerModal
            isVisible={showTimePicker}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            date={new Date().setHours(value.time.hour, value.time.minute)}
            onConfirm={handleTimeChange}
            onCancel={() => setShowTimePicker(false)}
          />
        </>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  daysContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dayButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  selectedDayButton: {
    backgroundColor: '#007AFF',
  },
  timeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
}); 