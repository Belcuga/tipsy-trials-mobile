import { Drink, Gender } from '@/types/player';
import { Picker } from '@react-native-picker/picker';
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
  onAdd: (player: {
    name: string;
    gender: string;
    drink: string;
    single: boolean;
  }) => void;
}

export default function AddPlayerModal({
  visible,
  onClose,
  onAdd,
}: AddPlayerModalProps) {
  const [name, setName] = useState('');
  const [gender, setGender] = useState('Male');
  const [drink, setDrink] = useState('Beer');
  const [single, setSingle] = useState(false);

  const handleAdd = () => {
    if (name.trim() === '') return;
    onAdd({ name, gender, drink, single });
    setName('');
    setGender('Male');
    setDrink('Beer');
    setSingle(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Add Player</Text>

          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter name"
            placeholderTextColor="#ccc"
          />

          <Text style={styles.label}>Gender</Text>
          <Picker
            selectedValue={gender}
            onValueChange={setGender}
            style={styles.picker}
          >
            <Picker.Item label="Male" value={Gender.Male} />
            <Picker.Item label="Female" value={Gender.Female} />
          </Picker>

          <Text style={styles.label}>What are you drinking?</Text>
          <Picker
            selectedValue={drink}
            onValueChange={setDrink}
            style={styles.picker}
          >
            <Picker.Item label="Beer" value={Drink.Beer} />
            <Picker.Item label="Wine" value={Drink.Wine} />
            <Picker.Item label="Whiskey, Vodka, or other Strong Drinks" value={Drink.Strong} />
            <Picker.Item label="Nothing" value={Drink.None} />
          </Picker>

          <Text style={styles.label}>Are you single?</Text>
          <View style={styles.switchGroup}>
            <View style={styles.switchRow}>
              <Switch
                value={single === true}
                onValueChange={() => setSingle(true)}
              />
              <Text style={styles.switchLabel}>
                Yes – You will get spicy challenges with other players
              </Text>
            </View>

            <View style={styles.switchRow}>
              <Switch
                value={single === false}
                onValueChange={() => setSingle(false)}
              />
              <Text style={styles.switchLabel}>
                No – You will not get spicy challenges with other players
              </Text>
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.addButton]}
              onPress={handleAdd}
            >
              <Text style={styles.buttonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,50,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#0B4FB5',
    padding: 20,
    borderRadius: 12,
    width: '85%',
  },
  modalTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  label: {
    color: 'white',
    fontSize: 14,
    marginTop: 10,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 5,
  },
  picker: {
    backgroundColor: 'white',
    borderRadius: 6,
    marginTop: 5,
  },
  switchGroup: {
    width: '100%',
    marginVertical: 10,
  },

  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  switchLabel: {
    flex: 1,
    marginLeft: 10,
    color: 'white',
    fontSize: 14,
  },
  switchText: {
    flex: 1,
    marginLeft: 10,
    color: 'white',
    fontSize: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#FF4C4C',
  },
  addButton: {
    backgroundColor: '#00FF00',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});