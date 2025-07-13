import { StyleSheet, View, ViewProps } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface CardProps extends ViewProps {
  variant?: 'elevated' | 'outlined' | 'filled';
}

export const Card = ({ 
  children, 
  style, 
  variant = 'elevated',
  ...rest 
}: CardProps) => {
  const { theme } = useTheme();
  
  const cardStyles = {
    elevated: {
      backgroundColor: theme.surface,
      shadowColor: theme.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    outlined: {
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },
    filled: {
      backgroundColor: theme.neutral[100],
    },
  };
  
  return (
    <View 
      style={[
        styles.card, 
        cardStyles[variant],
        style
      ]} 
      {...rest}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
});