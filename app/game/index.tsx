import ContactUsModal from '@/components/ContactUsModal';
import HowToPlayModal from '@/components/HowToPlayModal';
import { useGame } from '@/context/GameContext';
import { supabase } from '@/lib/supabase';
import { GameState } from '@/types/game';
import { Drink } from '@/types/player';
import { Question } from '@/types/question';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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

  if (!gameState) {
    return <></>
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

  function pickNextPlayer(state: GameState): string {
    const available = state.roundPlayersLeft;
    const randomIndex = Math.floor(Math.random() * available.length);
    return available[randomIndex];
  }

  function pickNextQuestion(playerId: string, state: GameState): Question {
    const player = state.players.find(p => p.playerInfo.id === playerId);
    if (!player) {
      const availableQuestions = state.questions.filter(
        q => !state.answeredQuestionIds.includes(q.id) && q.all_players
      );

      if (availableQuestions.length === 0) {
        throw new Error('No questions available for this difficulty');
      }

      return availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    }
    else {
      const desiredDifficulty = player.difficultyQueue[player.difficultyIndex];
      let allPlayersQuestion = false;
      let desiredDifficultyRequired = true;
      if (player.playerInfo.id === '0') {
        allPlayersQuestion = true;
        desiredDifficultyRequired = false;
      }

      const otherPlayers = state.players.filter(
        p => p.playerInfo.id !== player.playerInfo.id &&
          p.playerInfo.gender !== player.playerInfo.gender &&
          p.playerInfo.single &&
          p.playerInfo.id !== '0'
      );
      let diff = desiredDifficulty;
      let availableQuestions: Question[] = [];
      while (availableQuestions.length === 0) {
        availableQuestions = state.questions.filter(
          q => {
            const matchCount = (q.question.match(/\$\{player\}/g) || []).length;
            return (!desiredDifficultyRequired ||
              (q.difficulty === diff)) &&
              !state.answeredQuestionIds.includes(q.id) &&
              q.all_players === allPlayersQuestion &&
              matchCount <= otherPlayers.length
          }

        );
        diff--;
      }
      return availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    }

  }

  function replacePlayerPlaceholder(question: string, state: GameState, currentPlayerId: string): string {
    const PLACEHOLDER = '${player}';

    if (!question.includes(PLACEHOLDER)) return question;

    const currentPlayer = state.players.find(p => p.playerInfo.id === currentPlayerId);
    if (!currentPlayer) return question;
    // Filter eligible other players
    const otherPlayers = state.players.filter(
      p => p.playerInfo.id !== currentPlayerId &&
        p.playerInfo.gender !== currentPlayer.playerInfo.gender &&
        p.playerInfo.single &&
        p.playerInfo.id !== '0'
    );
    const placeholderCount = (question.match(/\$\{player\}/g) || []).length;
    if (otherPlayers.length === 0) return question;

    // Count how many placeholders are in the string
    // const placeholderCount = (question.match(/\$\{player\}/g) || []).length;

    // Shuffle and pick unique players for each placeholder
    const shuffled = [...otherPlayers].sort(() => Math.random() - 0.5);
    const pickedPlayers = shuffled.slice(0, placeholderCount);

    let replaced = question;
    for (let i = 0; i < placeholderCount; i++) {
      const name = pickedPlayers[i % pickedPlayers.length].playerInfo.name;
      replaced = replaced.replace(PLACEHOLDER, name);
    }

    return replaced;
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
      gameState.players.forEach(player => player.skipCount++);
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

  function showNumberOfSips() {
    if (gameState?.currentQuestion?.all_players) {
      const punishment = gameState.currentQuestion.punishment ?? 0;
      const sips = [
        `Beer drinker - take ${Math.ceil(punishment * 1.5)} sips`,
        `Wine drinker - take ${punishment * 1} sips`,
        `Strong drinks - take ${Math.ceil(punishment * 0.5)} sips`,
      ];

      if (gameState.currentQuestion.question.includes('Everyone')) {
        sips.unshift('If your answer is yes and you are:');
      } else if (gameState.currentQuestion.question.includes(`Who’s`)) {
        sips.unshift('The person with most votes, if they are:');
      }

      return sips.map((line, idx) => (
        <Text
          key={idx}
          style={[
            styles.sipText,
            idx === 0 && styles.sipTextBold
          ]}
        >
          {line}
        </Text>
      ));
    } else {
      const multiplier =
        currentPlayer?.playerInfo.drink === Drink.Beer
          ? 1.5
          : currentPlayer?.playerInfo.drink === Drink.Wine
            ? 1
            : 0.5;

      const sips = Math.ceil((gameState?.currentQuestion?.punishment ?? 0) * multiplier);

      return (
        <Text style={[styles.sipText, styles.sipTextBold]}>
          Answer or Take {sips} Sips
        </Text>
      );
    }
  }

  function shuffleArray<T>(array: T[]): T[] {
    return [...array].sort(() => Math.random() - 0.5);
  }

  function handleSkip() {
    if (!gameState) return;

    const currentPlayerId = gameState.currentPlayerId;
    const currentQuestion = gameState.currentQuestion;

    if (!currentPlayerId || !currentQuestion) return;

    const playerIndex = gameState.players.findIndex(p => p.playerInfo.id === currentPlayerId);
    if (playerIndex === -1) return;

    const player = gameState.players[playerIndex];

    // ✅ Find another question with SAME difficulty (not answered + not current)
    const availableQuestions = gameState.questions.filter(
      (q) =>
        q.difficulty === currentQuestion.difficulty &&
        !gameState.answeredQuestionIds.includes(q.id) &&
        q.id !== currentQuestion.id &&
        !q.all_players
    );

    if (availableQuestions.length === 0) {
      console.warn('No more questions available for this difficulty.');
      return;
    }

    // 🔀 Pick a random new question
    const newQuestion =
      availableQuestions[Math.floor(Math.random() * availableQuestions.length)];

    // ✅ Reduce skip count for the player (minimum 0)
    const updatedPlayers = [...gameState.players];
    updatedPlayers[playerIndex] = {
      ...player,
      skipCount: Math.max(0, player.skipCount - 1),
    };

    // ✅ Update game state with new question + updated skip count
    setGameState({
      ...gameState,
      players: updatedPlayers,
      currentQuestion: newQuestion,
    });

    setVotedType(null); // Reset like/dislike highlight
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Image
              source={require('../../assets/images/logo.png')}
              style={styles.logo}
          />
          <Text style={styles.title}>Tipsy Trials</Text>
        </View>

        <View style={styles.settingsContainer}>
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => setSettingsVisible(!settingsVisible)}
          >
            <Ionicons name="settings-outline" size={24} color="#fff" />
          </TouchableOpacity>
          {settingsVisible && (
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
            </View>
          )}
        </View>
      </View>

      {/* Player Turn */}
      <Text style={styles.playerTurn}>
        {currentPlayer?.playerInfo.name}'s Turn
      </Text>

      {/* Question Card */}
      <View style={styles.questionCard}>
        <Text style={styles.questionText}>{questionText}</Text>
        <View style={styles.consequenceContainer}>
          {showNumberOfSips()}
        </View>
      </View>

      {/* Vote Buttons */}
      <View style={styles.voteContainer}>
        <TouchableOpacity 
          style={[
            styles.voteButton, 
            votedType === 'dislike' && styles.votedButton,
            !!votedType && styles.disabledButton
          ]}
          onPress={() => handleVote('dislike')}
          disabled={!!votedType}
        >
          <Ionicons 
            name="thumbs-down-sharp"
            size={20} 
            color={votedType === 'dislike' ? '#fff' : '#1a0b2e'} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.voteButton, 
            votedType === 'like' && styles.votedButton,
            !!votedType && styles.disabledButton
          ]}
          onPress={() => handleVote('like')}
          disabled={!!votedType}
        >
          <Ionicons 
            name="thumbs-up-sharp"
            size={20} 
            color={votedType === 'like' ? '#fff' : '#1a0b2e'} 
          />
        </TouchableOpacity>
      </View>

      {/* Next Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.nextButtonWrapper} onPress={handleNext}>
          <LinearGradient
            colors={['#00F5A0', '#00D9F5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.nextButton}
          >
            <Text style={styles.buttonText}>Next</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <View style={styles.skipContainer}>
          {(currentPlayer?.skipCount ?? 0) > 0 && currentPlayer?.playerInfo.id !== '0' && (
            <TouchableOpacity onPress={handleSkip}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <HowToPlayModal
        visible={howToPlayVisible}
        onClose={() => setHowToPlayVisible(false)}
      />

      <ContactUsModal
        visible={contactVisible}
        onClose={() => setContactVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0b2e',
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
    marginTop: 20,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  playerTurn: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginVertical: 20,
    width: '100%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  questionText: {
    fontSize: 18,
    color: '#1a0b2e',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  consequenceContainer: {
    marginTop: 15,
    alignItems: 'flex-start',
    width: '100%',
  },
  voteContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 15,
    marginTop: 'auto',
  },
  voteButton: {
    width: 40,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  votedButton: {
    backgroundColor: '#00F5A0',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  nextButtonWrapper: {
    width: '80%',
  },
  nextButton: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#00F5A0',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  skipText: {
    color: '#fff',
    fontSize: 16,
  },
  sipText: {
    textAlign: 'left',
    color: '#333',
    fontSize: 14,
    marginBottom: 8,
    width: '100%',
  },
  sipTextBold: {
    fontWeight: 'bold',
    marginBottom: 12,
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
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  skipContainer: {
    height: 40,
    justifyContent: 'center',
    marginTop: 15,
  },
});
