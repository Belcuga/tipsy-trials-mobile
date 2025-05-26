import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    Keyboard,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import CustomPicker from './ui/CustomPicker';
import CustomSwitch from './ui/CustomSwitch';
import FormField from './ui/FormField';

interface AddPlayerModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (player: { name: string; gender: string; drink: string; single: boolean }) => void;
}

const GENDER_OPTIONS = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
];

const DRINK_OPTIONS = [
  { label: 'Beer', value: 'Beer' },
  { label: 'Wine', value: 'Wine' },
  { label: 'Whiskey, Vodka or other Strong Drinks', value: 'Strong' },
];

const AddPlayerModal: React.FC<AddPlayerModalProps> = ({ visible, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState('Male');
  const [drink, setDrink] = useState('Beer');
  const [single, setSingle] = useState(false);

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd({ name: name.trim(), gender, drink, single });
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setGender('Male');
    setDrink('Beer');
    setSingle(false);
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
          <View style={styles.modalView}>
            <View style={styles.header}>
              <Text style={styles.title}>Add a Player</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <FormField
                  label="Name"
                  placeholder="Enter the player's name"
                  value={name}
                  onChangeText={setName}
                  style={styles.input}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Gender</Text>
                <CustomPicker
                  options={GENDER_OPTIONS}
                  value={gender}
                  onValueChange={setGender}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>What are you drinking?</Text>
                <CustomPicker
                  options={DRINK_OPTIONS}
                  value={drink}
                  onValueChange={setDrink}
                />
              </View>

              <View style={styles.switchContainer}>
                <Text style={styles.label}>Are you single?</Text>
                <CustomSwitch
                  label="Yes - You will get spicy challenges with other players"
                  value={single}
                  onValueChange={(value) => setSingle(value)}
                />
                <CustomSwitch
                  label="No - You will not get spicy challenges with other players"
                  value={!single}
                  onValueChange={(value) => setSingle(!value)}
                />
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
};

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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    color: '#00F5A0',
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  form: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#00F5A0',
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 245, 160, 0.3)',
  },
  switchContainer: {
    marginTop: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  addButton: {
    borderRadius: 8,
    padding: 12,
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

export default React.memo(AddPlayerModal);