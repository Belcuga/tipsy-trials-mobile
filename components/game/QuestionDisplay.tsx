import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface QuestionDisplayProps {
  question: string;
  playerName: string;
  sipsText: string[];
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  question,
  playerName,
  sipsText,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.playerName}>{playerName === 'All Players' ? `${playerName}'`  : `${playerName}'s` } Turn</Text>
      <View style={styles.questionContainer}>
        <Text style={styles.question}>{question}</Text>
        {sipsText.map((item, index) => (
          <Text key={index} style={styles.sips}>{item}</Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  playerName: {
    color: '#00F5A0',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
  },
  questionContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  question: {
    color: '#fff',
    fontSize: 24,
    lineHeight: 32,
    textAlign: 'center',
    marginBottom: 16,
  },
  sips: {
    color: '#00F5A0',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default React.memo(QuestionDisplay); 