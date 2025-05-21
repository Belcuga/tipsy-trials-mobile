import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  Linking,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface ContactUsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ContactUsModal({ visible, onClose }: ContactUsModalProps) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          
          <Text style={styles.modalTitle}>Contact Us</Text>
          
          <Text style={styles.modalText}>
            Have suggestions or found a bug?
          </Text>
          
          <Text style={styles.modalText}>
            Feel free to reach out to us at:
          </Text>

          <TouchableOpacity 
            onPress={() => Linking.openURL('mailto:hello@tipsytrials.com')}
          >
            <Text style={[styles.modalText, styles.emailText]}>
              hello@tipsytrials.com
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose}>
            <LinearGradient
              colors={['#00F5A0', '#00D9F5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Got it!</Text>
            </LinearGradient>
          </TouchableOpacity>
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
    padding: 30,
    alignItems: 'center',
    width: '85%',
    maxWidth: 400,
  },
  closeButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    padding: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
    lineHeight: 24,
  },
  emailText: {
    color: '#00F5A0',
    textDecorationLine: 'underline',
    marginBottom: 25,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
