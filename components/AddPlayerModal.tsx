import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    Modal,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
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

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd({ name: name.trim(), gender, drink, single });
    setName('');
    setGender('Male');
    setDrink('Beer');
    setSingle(false);
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.header}>
            <Text style={styles.title}>Add Player</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter player name"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={gender}
                  onValueChange={(value) => setGender(value)}
                  style={styles.picker}
                  dropdownIconColor="#fff"
                >
                  <Picker.Item label="Male" value="Male" />
                  <Picker.Item label="Female" value="Female" />
                </Picker>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>What are you drinking?</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={drink}
                  onValueChange={(value) => setDrink(value)}
                  style={styles.picker}
                  dropdownIconColor="#fff"
                >
                  <Picker.Item label="Beer" value="Beer" />
                  <Picker.Item label="Wine" value="Wine" />
                  <Picker.Item label="Strong" value="Strong" />
                </Picker>
              </View>
            </View>

            <View style={styles.switchContainer}>
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
                  Single - Get spicy challenges
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
                  Not Single - No spicy challenges
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
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: '#1a0b2e',
    borderRadius: 20,
    width: '90%',
    maxWidth: 400,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    position: 'relative',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    padding: 5,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 10,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 12,
    color: '#fff',
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  picker: {
    color: '#fff',
    backgroundColor: 'transparent',
  },
  switchContainer: {
    gap: 15,
    marginTop: 10,
  },
  switchGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  switchLabel: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
    flex: 1,
  },
  activeLabel: {
    color: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
    marginTop: 30,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButton: {
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