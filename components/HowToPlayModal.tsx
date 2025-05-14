import React from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface HowToPlayModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function HowToPlayModal({ visible, onClose }: HowToPlayModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>

          <Text style={styles.title}>How to Play</Text>

          <Text style={styles.description}>
            Add players and pick your game modes (Dirty, Challenges, etc.).
          </Text>
          <Text style={styles.description}>
            Then take turns completing fun or spicy challenges.
          </Text>
          <Text style={styles.description}>
            Keep playing as long as you want or until you get black out drunk. Have fun!
          </Text>

          <TouchableOpacity style={styles.gotItButton} onPress={onClose}>
            <Text style={styles.gotItText}>Got it!</Text>
          </TouchableOpacity>
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
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  closeText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  description: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  gotItButton: {
    backgroundColor: '#00FF00',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
  },
  gotItText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});