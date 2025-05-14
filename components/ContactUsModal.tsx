import React from 'react';
import {
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
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Contact Us</Text>

          <Text style={styles.description}>
            Have questions, feedback, or need support?
          </Text>
          <Text style={styles.description}>
            Reach out to us at:
          </Text>
          <Text style={[styles.description, styles.email]}>
            hello@tipsytrials.com
          </Text>

          <TouchableOpacity style={styles.closeModalButton} onPress={onClose}>
            <Text style={styles.closeModalText}>Close</Text>
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
    marginBottom: 5,
  },
  email: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  closeModalButton: {
    backgroundColor: '#00FF00',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
  },
  closeModalText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
