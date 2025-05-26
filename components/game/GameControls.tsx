import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface GameControlsProps {
  onNext: () => void;
  onSkip: () => void;
  onLike: () => void;
  onDislike: () => void;
  votedType: 'like' | 'dislike' | null;
  skipCount: number;
}

const GameControls: React.FC<GameControlsProps> = ({
  onNext,
  onSkip,
  onLike,
  onDislike,
  votedType,
  skipCount,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.bottomContent}>
        <View style={styles.voteContainer}>
          <TouchableOpacity
            onPress={onDislike}
            disabled={votedType !== null}
            style={[
              styles.voteButton,
              votedType === 'dislike' && styles.dislikeVotedButton,
            ]}
          >
            <Ionicons
              name={votedType === 'dislike' ? 'thumbs-down' : 'thumbs-down-outline'}
              size={24}
              color={votedType === 'dislike' ? '#fff' : '#fff'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onLike}
            disabled={votedType !== null}
            style={[
              styles.voteButton,
              votedType === 'like' && styles.likeVotedButton,
            ]}
          >
            <Ionicons
              name={votedType === 'like' ? 'thumbs-up' : 'thumbs-up-outline'}
              size={24}
              color={votedType === 'like' ? '#fff' : '#fff'}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={onNext} style={styles.buttonWrapper}>
          <LinearGradient
            colors={['#00F5A0', '#00D9F5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.nextButton}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.skipContainer}>
          {skipCount > 0 && (
            <TouchableOpacity onPress={onSkip}>
              <Text style={styles.skipText}>Skip ({skipCount})</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  bottomContent: {
    padding: 20,
    paddingBottom: 40,
  },
  voteContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 30,
  },
  voteButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 8,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeVotedButton: {
    backgroundColor: '#00F5A0',
    borderWidth: 1,
    borderColor: '#fff',
  },
  dislikeVotedButton: {
    backgroundColor: '#FF4040',
    borderWidth: 1,
    borderColor: '#fff',
  },
  buttonWrapper: {
    width: '100%',
    marginBottom: 12,
  },
  skipContainer: {
    height: 40,
    justifyContent: 'center',
  },
  nextButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  skipText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
  },
});

export default React.memo(GameControls); 