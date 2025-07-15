import { StyleSheet, Text, View } from 'react-native';
import { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/hooks/useTheme';
import type { ColorScheme } from '@/constants/colors';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>{icon}</View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionLabel && onAction && (
        <View style={styles.actionContainer}>
          <Button onPress={onAction} variant="primary">
            {actionLabel}
          </Button>
        </View>
      )}
    </View>
  );
};

const getStyles = (theme: ColorScheme) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: theme.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: theme.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  actionContainer: {
    width: '100%',
    maxWidth: 200,
    marginTop: 8,
  },
});