import { StyleSheet, Text, TextInput, View, TextInputProps, Pressable } from 'react-native';
import { ReactNode } from 'react';
import { ColorScheme } from '@/constants/colors';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onRightIconPress?: () => void;
  theme: ColorScheme;
}

export const Input = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  autoCorrect,
  theme,
  ...rest
}: InputProps) => {
  const hasError = !!error;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {label && <Text style={[styles.label, { color: theme.text.primary }]}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.surface,
            borderColor: hasError ? theme.error : theme.border,
          },
        ]}
      >
        {leftIcon && (
          <View style={[styles.leftIcon, { backgroundColor: theme.surface }]}>
            {leftIcon}
          </View>
        )}
        <TextInput
          style={[
            styles.input,
            leftIcon ? styles.inputWithLeftIcon : null,
            rightIcon ? styles.inputWithRightIcon : null,
            {
              color: theme.text.primary,
              backgroundColor: theme.surface,
            },
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.text.tertiary}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          {...rest}
        />
        {rightIcon && (
          <Pressable
            style={[styles.rightIcon, { backgroundColor: theme.surface }]}
            onPress={onRightIconPress}
          >
            {rightIcon}
          </Pressable>
        )}
      </View>
      {error && (
        <Text style={[styles.error, { color: theme.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  inputWithLeftIcon: {
    marginLeft: 8,
  },
  inputWithRightIcon: {
    marginRight: 8,
  },
  leftIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  rightIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
});