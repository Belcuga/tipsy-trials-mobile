import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

interface FormFieldProps extends TextInputProps {
  label: string;
}

const FormField: React.FC<FormFieldProps> = ({ label, style, ...props }) => {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor="rgba(255, 255, 255, 0.5)"
        returnKeyType="done"
        blurOnSubmit={true}
        selectionColor="#00F5A0"
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default React.memo(FormField); 