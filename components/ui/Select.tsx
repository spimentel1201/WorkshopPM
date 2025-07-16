import { StyleSheet, Text, View, Pressable, Modal, FlatList } from 'react-native';
import { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react-native';
import { ColorScheme } from '@/constants/colors';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  error?: string;
  theme: ColorScheme;
}

export const Select = ({
  label,
  placeholder = 'Seleccionar...',
  value,
  onValueChange,
  options,
  error,
  theme,
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(option => option.value === value);

  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue);
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: theme.text.primary }]}>{label}</Text>}
      
      <Pressable
        onPress={() => setIsOpen(true)}
        style={[
          styles.selectButton,
          {
            backgroundColor: theme.surface,
            borderColor: error ? theme.error : theme.border,
          },
        ]}
      >
        <Text style={[
          styles.selectText,
          !selectedOption && styles.placeholderText,
          {
            color: selectedOption ? theme.text.primary : theme.text.tertiary,
          },
        ]}>
          {selectedOption?.label || placeholder}
        </Text>
        <ChevronDown
          size={20}
          color={error ? theme.error : theme.text.secondary}
          style={styles.icon}
        />
      </Pressable>

      {error && (
        <Text style={[styles.error, { color: theme.error }]}>
          {error}
        </Text>
      )}

      <Modal
        animationType="slide"
        transparent
        visible={isOpen}
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsOpen(false)}
        >
          <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
            <FlatList
              data={options}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => handleSelect(item.value)}
                  style={[styles.option, { backgroundColor: theme.surface }]}
                >
                  <Text style={[styles.optionText, { color: theme.text.primary }]}>
                    {item.label}
                  </Text>
                  {item.value === value && (
                    <Check
                      size={20}
                      color={theme.primary[500]}
                      style={styles.checkIcon}
                    />
                  )}
                </Pressable>
              )}
              keyExtractor={item => item.value}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        </Pressable>
      </Modal>
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
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectText: {
    flex: 1,
    fontSize: 16,
  },
  placeholderText: {
    fontStyle: 'italic',
  },
  icon: {
    marginLeft: 8,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: 'transparent',
    flex: 1,
    justifyContent: 'flex-end',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  optionText: {
    fontSize: 16,
    flex: 1,
  },
  checkIcon: {
    marginLeft: 8,
  },
});