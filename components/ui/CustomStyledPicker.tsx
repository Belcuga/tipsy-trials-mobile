import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface PickerOption {
  label: string;
  value: string;
}

interface CustomStyledPickerProps {
  options: PickerOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  label: string; // Add label prop for accessibility and potentially display above the picker
}

const { height: screenHeight } = Dimensions.get('window');

const CustomStyledPicker: React.FC<CustomStyledPickerProps> = ({
  options,
  value,
  onValueChange,
  placeholder,
  label,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [pickerButtonLayout, setPickerButtonLayout] = useState<{ x: number, y: number, width: number, height: number, pageX: number, pageY: number } | null>(null);
  const pickerButtonRef = useRef<View>(null);
  const displayValue = options.find((opt) => opt.value === value)?.label || placeholder || 'Select an option';

  const handleSelect = (itemValue: string) => {
    onValueChange(itemValue);
    setShowPicker(false);
  };

  const openPicker = () => {
    if (pickerButtonRef.current) {
      pickerButtonRef.current.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
        setPickerButtonLayout({ x, y, width, height, pageX, pageY });
        setShowPicker(true);
      });
    }
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        ref={pickerButtonRef}
        style={styles.pickerButton}
        onPress={openPicker}
      >
        <Text style={styles.pickerButtonText}>{displayValue}</Text>
        <Ionicons name={showPicker ? "chevron-up" : "chevron-down"} size={20} color="#fff" />
      </TouchableOpacity>

      <Modal
        visible={showPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPicker(false)}
        >
          {pickerButtonLayout && (
            <View
              style={[
                styles.modalContent,
                {
                  position: 'absolute',
                  top: pickerButtonLayout.pageY + pickerButtonLayout.height,
                  left: pickerButtonLayout.pageX,
                  width: pickerButtonLayout.width,
                  maxHeight: screenHeight - (pickerButtonLayout.pageY + pickerButtonLayout.height) - 20,
                },
              ]}
            >
              {options.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionItem,
                    option.value === value && styles.selectedOptionItem,
                  ]}
                  onPress={() => handleSelect(option.value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      option.value === value && styles.selectedOptionText,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        color: '#00F5A0',
        fontSize: 16,
        marginBottom: 8,
    },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2D1B69',
    borderRadius: 10,
    padding: 12,
    minHeight: 50,
  },
  pickerButtonText: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#1a0b2e',
    borderRadius: 10,
    paddingVertical: 10,
  },
  optionItem: {
    padding: 12,
  },
  selectedOptionItem: {
    backgroundColor: '#007AFF',
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
  },
  selectedOptionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default CustomStyledPicker; 