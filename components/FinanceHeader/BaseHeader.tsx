import React from 'react';
import { 
  StyleSheet, 
  View, 
  TouchableOpacity,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { ThemedText, ThemedInput } from '../Themed';
import { useTheme } from '../useTheme';
import { MonthNavigation } from '../MonthNavigation';

export type BaseHeaderProps = {
  title: string;
  showSearch: boolean;
  isGrouped: boolean;
  searchQuery: string;
  currentDate: Date;
  onSearchChange: (query: string) => void;
  onSearchToggle: () => void;
  onGroupToggle: () => void;
  onSortPress: () => void;
  onMonthChange: (date: Date) => void;
};

export const BaseHeader = ({
  title,
  showSearch,
  isGrouped,
  searchQuery,
  currentDate,
  onSearchChange,
  onSearchToggle,
  onGroupToggle,
  onSortPress,
  onMonthChange,
}: BaseHeaderProps) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Title and icons row */}
      <View style={styles.headerContainer}>
        <ThemedText style={styles.headerTitle}>{title}</ThemedText>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={[
              styles.iconButton,
              isGrouped && {
                backgroundColor: colors.surface,
                borderRadius: 8
              }
            ]}
            onPress={onGroupToggle}
          >
            <FontAwesome name="th-large" size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onSortPress}
          >
            <FontAwesome name="sort" size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.iconButton,
              showSearch && {
                backgroundColor: colors.surface,
                borderRadius: 8
              }
            ]}
            onPress={onSearchToggle}
          >
            <FontAwesome name="search" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search input */}
      {showSearch && (
        <ThemedInput
          label=""
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder="Search by name..."
          style={styles.searchInput}
          autoFocus={true}
        />
      )}

      {/* Month navigation */}
      <MonthNavigation 
        currentDate={currentDate} 
        onMonthChange={onMonthChange} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 1,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    padding: 8,
  },
  searchInput: {
    height: 40,
    marginHorizontal: 10,
    marginBottom: 10,
  },
});