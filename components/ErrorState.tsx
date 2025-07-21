import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  retryButtonText?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  message,
  onRetry,
  retryButtonText = 'Reintentar',
}) => {
  const { isDark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f5f5f5' }]}>
      <MaterialIcons 
        name="error-outline" 
        size={48} 
        color={isDark ? '#EF4444' : '#DC2626'} 
        style={styles.icon}
      />
      <Text style={[styles.message, { color: isDark ? '#E5E7EB' : '#374151' }]}>
        {message}
      </Text>
      {onRetry && (
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: isDark ? '#1F2937' : '#E5E7EB' }]}
          onPress={onRetry}
        >
          <Text style={[styles.retryText, { color: isDark ? '#F3F4F6' : '#111827' }]}>
            {retryButtonText}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  icon: {
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  retryText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ErrorState;
