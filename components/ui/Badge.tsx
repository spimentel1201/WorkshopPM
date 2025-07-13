import { StyleSheet, Text, View } from 'react-native';
import colors from '@/constants/colors';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
}

export const Badge = ({ text, variant = 'primary' }: BadgeProps) => {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'primary':
        return colors.primary['100'];
      case 'secondary':
        return colors.secondary['100'];
      case 'success':
        return '#dcfce7'; // Light green
      case 'warning':
        return '#fef3c7'; // Light amber
      case 'error':
        return '#fee2e2'; // Light red
      case 'info':
        return '#dbeafe'; // Light blue
      default:
        return colors.primary['100'];
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
        return colors.primary['700'];
      case 'secondary':
        return colors.secondary['700'];
      case 'success':
        return '#15803d'; // Dark green
      case 'warning':
        return '#b45309'; // Dark amber
      case 'error':
        return '#b91c1c'; // Dark red
      case 'info':
        return '#1d4ed8'; // Dark blue
      default:
        return colors.primary['700'];
    }
  };

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: getBackgroundColor() },
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: getTextColor() },
        ]}
      >
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
});