import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import React, { useState } from 'react';
import {
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

interface PickerOption {
  label: string;
  value: string;
}

interface CustomPickerProps {
  options: PickerOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

const CustomPicker: React.FC<CustomPickerProps> = ({
  options,
  value,
  onValueChange,
  placeholder,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const displayValue = options.find((opt) => opt.value === value)?.label || value;

  if (Platform.OS === 'ios') {
    return (
      <>
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => setShowPicker(true)}
        >
          <Text style={styles.pickerButtonText}>
            {displayValue || placeholder}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#fff" />
        </TouchableOpacity>

        <Modal
          visible={showPicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowPicker(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowPicker(false)}>
            <View style={styles.pickerModalContainer}>
              <View style={styles.pickerModalContent}>
                <View style={styles.pickerHeader}>
                  <TouchableOpacity onPress={() => setShowPicker(false)}>
                    <Text style={styles.pickerDoneButton}>Done</Text>
                  </TouchableOpacity>
                </View>
                <Picker
                  selectedValue={value}
                  onValueChange={(itemValue) => {
                    onValueChange(itemValue);
                    setShowPicker(false);
                  }}
                  style={styles.iosPicker}
                >
                  {options.map((option) => (
                    <Picker.Item
                      key={option.value}
                      label={option.label}
                      value={option.value}
                      color="#000"
                    />
                  ))}
                </Picker>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </>
    );
  }

  return (
    <View style={styles.pickerContainer}>
      <Picker
        selectedValue={value}
        onValueChange={onValueChange}
        style={[styles.picker, { color: '#fff' }]}
        dropdownIconColor="#00F5A0"
        mode="dropdown"
      >
        {options.map((option) => (
          <Picker.Item
            key={option.value}
            label={option.label}
            value={option.value}
            style={{ backgroundColor: '#1a0b2e' }}
            color="#fff"
          />
        ))}
      </Picker>
    </View>
  );
};

const styles = StyleSheet.create({
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
  },
  pickerButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  pickerModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  pickerHeader: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'flex-end',
  },
  pickerDoneButton: {
    color: '#007AFF',
    fontSize: 17,
  },
  iosPicker: {
    height: 215,
  },
  pickerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  picker: {
    height: 50,
  },
});

export default React.memo(CustomPicker); 