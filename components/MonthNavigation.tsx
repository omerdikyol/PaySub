import { StyleSheet, TouchableOpacity, View, Modal, Platform } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { ThemedText, ThemedView } from './Themed';
import { useTheme } from './useTheme';
import { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';

interface MonthNavigationProps {
  currentDate: Date;
  onMonthChange: (date: Date) => void;
}

export function MonthNavigation({ currentDate, onMonthChange }: MonthNavigationProps) {
  const { colors, colorScheme } = useTheme();
  const [showPicker, setShowPicker] = useState(false);

  const monthYear = currentDate.toLocaleString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onMonthChange(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onMonthChange(newDate);
  };

  const handleDateChange = (_: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
        setShowPicker(false); // Close picker on Android
    }
    if (Platform.OS === 'ios') {
        setShowPicker(Platform.OS === 'ios'); // Only iOS needs manual closing
    }
    
    if (selectedDate) {
        // Keep the first day of the month when changing dates
        const newDate = new Date(selectedDate);
        newDate.setDate(1);
        onMonthChange(newDate);
    }
};

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={goToPreviousMonth}>
        <FontAwesome name="chevron-left" size={20} color={colors.text} />
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => setShowPicker(true)}>
        <ThemedText style={styles.monthText}>{monthYear}</ThemedText>
      </TouchableOpacity>

      <TouchableOpacity onPress={goToNextMonth}>
        <FontAwesome name="chevron-right" size={20} color={colors.text} />
      </TouchableOpacity>

      {showPicker && (
        Platform.OS === 'ios' ? (
          <Modal
            transparent={true}
            animationType="fade"
            visible={showPicker}
            onRequestClose={() => setShowPicker(false)}
          >
            <TouchableOpacity 
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setShowPicker(false)}
            >
              <ThemedView style={styles.pickerContainer}>
                <DateTimePicker
                  value={currentDate}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  themeVariant={colorScheme} // Add this line
                />
              </ThemedView>
            </TouchableOpacity>
          </Modal>
        ) : (
          <DateTimePicker
            value={currentDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            themeVariant={colorScheme} // Add this line
          />
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    padding: 10, // Add padding for better touch target
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    padding: 20,
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  }
});