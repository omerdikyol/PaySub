import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Platform } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

export default function SpinnerDatePicker() {
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Show picker
  const showPicker = () => setIsPickerVisible(true);

  // Hide picker
  const hidePicker = () => setIsPickerVisible(false);

  // Confirm selected date
  const handleConfirm = (date: Date) => {
    setSelectedDate(date);
    hidePicker();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Selected Date:</Text>
      <Text style={styles.dateText}>{selectedDate.toDateString()}</Text>

      <Button title="Open Spinner Date Picker" onPress={showPicker} />

      <DateTimePickerModal
        isVisible={isPickerVisible}
        mode="date"
        /** Force spinner on iOS, default on Android **/
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        date={selectedDate}
        onConfirm={handleConfirm}
        onCancel={hidePicker}
      />
    </View>
  );
}

// Just some basic styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', 
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#F8F9FA',
  },
  label: {
    fontSize: 18,
    marginBottom: 6,
  },
  dateText: {
    fontSize: 16,
    marginBottom: 20,
  },
});
