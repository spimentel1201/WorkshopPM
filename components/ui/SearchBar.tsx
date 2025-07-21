import React from 'react';
import { TextInput, StyleSheet, View, TextInputProps, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

interface SearchBarProps extends TextInputProps {
  containerStyle?: ViewStyle;
}

const SearchBar: React.FC<SearchBarProps> = ({
  style,
  containerStyle,
  ...props
}) => {
  const { isDark } = useTheme();

  return (
    <View style={[styles.container, containerStyle]}>
      <MaterialIcons 
        name="search" 
        size={20} 
        color={isDark ? '#9CA3AF' : '#6B7280'} 
        style={styles.icon}
      />
      <TextInput
        style={[
          styles.input,
          { 
            color: isDark ? '#FFFFFF' : '#111827',
            backgroundColor: isDark ? '#1F2937' : '#F3F4F6',
          },
          style,
        ]}
        placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  input: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    paddingLeft: 40,
    paddingRight: 12,
    fontSize: 16,
  },
  icon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
});

export default SearchBar;
