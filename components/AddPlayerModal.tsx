import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    Keyboard,
    Modal,
    Platform,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';

interface AddPlayerModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (player: { name: string; gender: string; drink: string; single: boolean }) => void;
}

export default function AddPlayerModal({ visible, onClose, onAdd }: AddPlayerModalProps) {
  const [name, setName] = useState('');
  const [gender, setGender] = useState('Male');
  const [drink, setDrink] = useState('Beer');
  const [single, setSingle] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [showDrinkPicker, setShowDrinkPicker] = useState(false);

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd({ name: name.trim(), gender, drink, single });
    setName('');
    setGender('Male');
    setDrink('Beer');
    setSingle(false);
  };

  const renderPicker = (type: 'gender' | 'drink') => {
    const isGender = type === 'gender';
    const options = isGender
      ? [{ label: 'Male', value: 'Male' }, { label: 'Female', value: 'Female' }]
      : [
        { label: 'Beer', value: 'Beer' },
        { label: 'Wine', value: 'Wine' },
        { label: 'Whiskey, Vodka or other Strong Drinks', value: 'Strong' }
      ];

    const value = isGender ? gender : drink;
    const setValue = isGender ? setGender : setDrink;
    const showPicker = isGender ? showGenderPicker : showDrinkPicker;
    const setShowPicker = isGender ? setShowGenderPicker : setShowDrinkPicker;
    const displayValue = isGender ? value : options.find(opt => opt.value === value)?.label || value;

    if (Platform.OS === 'ios') {
      return (
        <>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowPicker(true)}
          >
            <Text style={styles.pickerButtonText}>{displayValue}</Text>
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
                  <View>
                    <Picker
                      selectedValue={value}
                      onValueChange={(itemValue) => {
                        setValue(itemValue);
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
          onValueChange={(itemValue) => setValue(itemValue)}
          style={[styles.picker, { color: '#fff' }]}
          dropdownIconColor="#fff"
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

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={styles.centeredView}>
          <View style={[styles.modalView, { elevation: 0 }]}>
            <View style={styles.header}>
              <Text style={styles.title}>Add a Player</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter the player's name"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={name}
                  onChangeText={setName}
                  returnKeyType="done"
                  onSubmitEditing={dismissKeyboard}
                  blurOnSubmit={true}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Gender</Text>
                {renderPicker('gender')}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>What are you drinking?</Text>
                {renderPicker('drink')}
              </View>

              <View style={styles.switchContainer}>
               <Text style={styles.label}>Are you single?</Text>
                <View style={styles.switchGroup}>
                  <Switch
                    value={single}
                    onValueChange={(value) => {
                      if (value) setSingle(true);
                    }}
                    trackColor={{ false: '#3a3a3a', true: '#00F5A0' }}
                    thumbColor={single ? '#fff' : '#f4f3f4'}
                  />
                  <Text style={[styles.switchLabel, single && styles.activeLabel]}>
                    Yes - You will get spicy challenges with other players
                  </Text>
                </View>
                <View style={styles.switchGroup}>
                  <Switch
                    value={!single}
                    onValueChange={(value) => {
                      if (value) setSingle(false);
                    }}
                    trackColor={{ false: '#3a3a3a', true: '#00F5A0' }}
                    thumbColor={!single ? '#fff' : '#f4f3f4'}
                  />
                  <Text style={[styles.switchLabel, !single && styles.activeLabel]}>
                    No - You will not get spicy challenges with other players
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAdd}
                disabled={!name.trim()}
                style={{ flex: 1 }}
              >
                <LinearGradient
                  colors={['#00F5A0', '#00D9F5']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.addButton, !name.trim() && styles.disabledButton]}
                >
                  <Text style={styles.buttonText}>Add</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
  },
  modalView: {
    backgroundColor: '#1a0b2e',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    ...Platform.select({
      android: {
        elevation: 0,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    padding: 5,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2D1B69',
    borderRadius: 10,
    padding: Platform.OS === 'ios' ? 15 : 12,
    color: '#fff',
    fontSize: 16,
  },
  pickerButton: {
    backgroundColor: '#2D1B69',
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: '#2D1B69',
    borderRadius: 10,
  },
  picker: {
    backgroundColor: 'transparent',
    color: '#fff',
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
    paddingBottom: 20,
  },
  pickerHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    padding: 15,
    alignItems: 'flex-end',
  },
  pickerDoneButton: {
    color: '#007AFF',
    fontSize: 17,
    fontWeight: '600',
  },
  iosPicker: {
    backgroundColor: '#fff',
  },
  switchContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  switchGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingRight: 20,
  },
  switchLabel: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
    marginLeft: 15,
    flex: 1,
  },
  activeLabel: {
    color: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});