import ContactUsModal from '@/components/ContactUsModal';
import GameControls from '@/components/game/GameControls';
import QuestionDisplay from '@/components/game/QuestionDisplay';
import HowToPlayModal from '@/components/HowToPlayModal';
import LogoSvg from '@/components/ui/LogoSvg';
import { useGame } from '@/context/GameContext';
import { pickNextPlayer, pickNextQuestion, replacePlayerPlaceholder, showNumberOfSips, shuffleArray } from '@/lib/gameUtils';
import { supabase } from '@/lib/supabase';
import { Question } from '@/types/question';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, Linking, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function GameScreen() {
  const { gameState, setGameState, setLoading } = useGame();
  const [votedType, setVotedType] = useState<'like' | 'dislike' | null>(null);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [howToPlayVisible, setHowToPlayVisible] = useState(false);
  const [contactVisible, setContactVisible] = useState(false);

  useEffect(() => {
    if (!gameState) return;

    if (!gameState.currentPlayerId) {
      const nextPlayerId = pickNextPlayer(gameState);
      const nextQuestion = pickNextQuestion(nextPlayerId, gameState);

      setGameState({
        ...gameState,
        currentPlayerId: nextPlayerId,
        currentQuestion: nextQuestion,
      });
    }
    setLoading(false);
  }, [gameState]);

  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === 'ios') {
        router.setParams({
          gestureEnabled: 'true',
          gestureDirection: 'horizontal',
        });
      }
    }, [])
  );

  if (!gameState) {
    return null;
  }

  const currentPlayer = gameState.players.find(p => p.playerInfo.id === gameState.currentPlayerId);
  const questionText = replacePlayerPlaceholder(
    gameState.currentQuestion?.question || '',
    gameState,
    currentPlayer?.playerInfo.id || ''
  );

  async function handleVote(type: 'like' | 'dislike') {
    if (!gameState || !gameState.currentQuestion) return;

    const questionId = gameState.currentQuestion.id;
    const column = type === 'like' ? 'like_count' : 'dislike_count';

    const { data, error } = await supabase
      .from('questions')
      .select(column)
      .eq('id', questionId)
      .single();

    if (error || !data) {
      console.error('Failed to fetch current vote count:', error?.message);
      return;
    }

    const currentCount = (data as Question)[column] ?? 0;

    const { error: updateError } = await supabase
      .from('questions')
      .update({ [column]: currentCount + 1 })
      .eq('id', questionId);

    if (updateError) {
      console.error('Failed to update vote count:', updateError.message);
      return;
    }

    setVotedType(type);
  }

  function handleNext() {
    if (!gameState) return;
    const updatedAnsweredIds = [...gameState.answeredQuestionIds, gameState.currentQuestion?.id ?? 0];
    const updatedRoundPlayersLeft = gameState.roundPlayersLeft.filter(id => id !== gameState.currentPlayerId);
    let updatedRoundNumber = gameState.roundNumber;

    // First: If still normal players left
    if (updatedRoundPlayersLeft.length > 0) {
      const nextPlayerId = pickNextPlayer({ ...gameState, roundPlayersLeft: updatedRoundPlayersLeft });

      const player = gameState.players.find(p => p.playerInfo.id === nextPlayerId);
      if (!player) return;

      let updatedDifficultyIndex = player.difficultyIndex + 1;
      if (updatedDifficultyIndex >= gameState.existingDifficulties.length) {
        player.difficultyQueue = shuffleArray(gameState.existingDifficulties);
        updatedDifficultyIndex = 0;
      }
      player.difficultyIndex = updatedDifficultyIndex;

      const nextQuestion = pickNextQuestion(nextPlayerId, {
        ...gameState,
        answeredQuestionIds: updatedAnsweredIds,
      });

      setGameState({
        ...gameState,
        answeredQuestionIds: updatedAnsweredIds,
        roundPlayersLeft: updatedRoundPlayersLeft,
        currentPlayerId: nextPlayerId,
        currentQuestion: nextQuestion,
      });

      setVotedType(null);
      return;
    }

    // If players finished and bonus was done -> start new round
    const newRoundPlayers = gameState.players.map(p => p.playerInfo.id);
    updatedRoundNumber += 1;

    // Give extra skip every 10 rounds
    if (updatedRoundNumber % 10 === 1 && updatedRoundNumber !== 1) {
      gameState.players.forEach(player => player.playerInfo.id === '0' ? player.skipCount = 0 : player.skipCount++);
    }

    const nextPlayerId = pickNextPlayer({ ...gameState, roundPlayersLeft: newRoundPlayers });

    const player = gameState.players.find(p => p.playerInfo.id === nextPlayerId);
    if (!player) return;

    let updatedDifficultyIndex = player.difficultyIndex + 1;
    if (updatedDifficultyIndex >= gameState.existingDifficulties.length) {
      player.difficultyQueue = shuffleArray(gameState.existingDifficulties);
      updatedDifficultyIndex = 0;
    }
    player.difficultyIndex = updatedDifficultyIndex;

    const nextQuestion = pickNextQuestion(nextPlayerId, {
      ...gameState,
      answeredQuestionIds: updatedAnsweredIds,
    });

    setGameState({
      ...gameState,
      answeredQuestionIds: updatedAnsweredIds,
      roundPlayersLeft: newRoundPlayers,
      roundNumber: updatedRoundNumber,
      currentPlayerId: nextPlayerId,
      currentQuestion: nextQuestion,
    });

    setVotedType(null);
  }

  function handleSkip() {
    if (!gameState || !currentPlayer || currentPlayer.skipCount <= 0) return;

    currentPlayer.skipCount--;

    // Get a new question for the current player
    const updatedAnsweredIds = [...gameState.answeredQuestionIds, gameState.currentQuestion?.id ?? 0];
    const nextQuestion = pickNextQuestion(currentPlayer.playerInfo.id, {
      ...gameState,
      answeredQuestionIds: updatedAnsweredIds,
    });

    setGameState({
      ...gameState,
      answeredQuestionIds: updatedAnsweredIds,
      currentQuestion: nextQuestion,
    });

    setVotedType(null);
  }

  const sips = showNumberOfSips(gameState, currentPlayer);

  return (
    <TouchableWithoutFeedback onPress={() => setSettingsVisible(false)}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
               <LogoSvg/>
            <Text style={styles.titleText}>Tipsy Trials</Text>
          </View>
          <View style={styles.settingsContainer}>
            <TouchableOpacity
              style={styles.settingsBtn}
              onPress={(e) => {
                e.stopPropagation();
                setSettingsVisible(!settingsVisible);
              }}
            >
              <Ionicons name="settings-outline" size={28} color="#fff" />
            </TouchableOpacity>
            {settingsVisible && (
              <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                <View style={styles.dropdown}>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSettingsVisible(false);
                      setHowToPlayVisible(true);
                    }}
                  >
                    <Text style={styles.dropdownText}>How to Play</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSettingsVisible(false);
                      setContactVisible(true);
                    }}
                  >
                    <Text style={styles.dropdownText}>Contact Us</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      const url = 'https://www.tipsytrials.com/policy';
                      Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
                    }}
                  >
                    <Text style={styles.dropdownText}>Privacy Policy</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            )}
          </View>
        </View>

        <View style={styles.content}>
          <QuestionDisplay
            question={questionText}
            playerName={currentPlayer?.playerInfo.name || ''}
            sipsText={sips}
          />
        </View>

        <GameControls
          onNext={handleNext}
          onSkip={handleSkip}
          onLike={() => handleVote('like')}
          onDislike={() => handleVote('dislike')}
          votedType={votedType}
          skipCount={currentPlayer?.skipCount || 0}
        />

        <HowToPlayModal
          visible={howToPlayVisible}
          onClose={() => setHowToPlayVisible(false)}
        />

        <ContactUsModal
          visible={contactVisible}
          onClose={() => setContactVisible(false)}
        />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0b2e',
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 30,
    position: 'relative',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 4,
  },
  titleText: {
    color: '#00F5A0',
    fontSize: 24,
    fontWeight: 'bold',
  },
  settingsContainer: {
    position: 'relative',
  },
  settingsBtn: {
    padding: 5,
  },
  dropdown: {
    position: 'absolute',
    top: 40,
    right: 0,
    backgroundColor: '#1a0b2e',
    borderRadius: 10,
    padding: 5,
    minWidth: 150,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
  },
  dropdownItem: {
    padding: 12,
    borderRadius: 8,
  },
  dropdownText: {
    color: '#00F5A0',
    fontSize: 16,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingBottom: 140,
  },
});
