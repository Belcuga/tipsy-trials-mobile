import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

interface CustomSwitchProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  activeTrackColor?: string;
  inactiveTrackColor?: string;
  thumbColor?: string;
}

const CustomSwitch: React.FC<CustomSwitchProps> = ({
  label,
  value,
  onValueChange,
  activeTrackColor = '#00F5A0',
  inactiveTrackColor = '#3a3a3a',
  thumbColor = '#fff',
}) => {
  return (
    <View style={styles.switchGroup}>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: inactiveTrackColor, true: activeTrackColor }}
        thumbColor={thumbColor}
      />
      <Text style={[styles.switchLabel, value && styles.activeLabel]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  switchGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  switchLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 12,
    flex: 1,
  },
  activeLabel: {
    color: '#fff',
  },
});

export default React.memo(CustomSwitch); 