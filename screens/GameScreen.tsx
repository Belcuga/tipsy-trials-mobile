import { useGame } from '@/context/GameContext';
import { supabase } from '@/lib/supabase';
import { GameState } from '@/types/game';
import { Drink } from '@/types/player';
import { Question } from '@/types/question';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function GameScreen() {
  const router = useRouter();
    const { gameState, setGameState, setLoading } = useGame();
    const [votedType, setVotedType] = useState<'like' | 'dislike' | null>(null);

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
        sips.unshift('If your answer is yes and you are:')
      }
      else if (gameState.currentQuestion.question.includes(`Who’s`)) {
        sips.unshift('The person with most votes, if they are:')
      }

      return sips.map((line, idx) => (
        <p key={idx} className={`leading-tight text-left ${idx === 0 ? 'font-semibold' : ''}`}>
          {line}
        </p>
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
        <p className="leading-tight text-left font-semibold">
          Answer or Take {sips} Sips
        </p>
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>Tipsy Trials</Text>
        <TouchableOpacity style={styles.settingsBtn}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Player turn */}
      <Text style={styles.turnText}>{currentPlayer?.playerInfo?.name ?? ''}'s Turn</Text>

      {/* Question card */}
      <View style={styles.card}>
        <Text style={styles.questionText}>{gameState?.currentQuestion?.question ?? ''}</Text>
      </View>

      {/* Buttons */}
      <View style={styles.feedbackButtons}>
        <TouchableOpacity style={styles.feedbackIcon}>
          <Text style={styles.iconText}>👎</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.feedbackIcon}>
          <Text style={styles.iconText}>👍</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextText}>Next</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B4FB5',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
    justifyContent: 'center',
    position: 'relative',
  },
  backIcon: {
    fontSize: 24,
    color: 'white',
    position: 'absolute',
    left: 10,
  },
  logo: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  settingsBtn: {
    position: 'absolute',
    right: 10,
  },
  settingsIcon: {
    fontSize: 24,
    color: 'white',
  },
  turnText: {
    fontSize: 18,
    color: 'white',
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    marginBottom: 30,
    width: '100%',
  },
  questionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  feedbackButtons: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  feedbackIcon: {
    backgroundColor: '#444',
    borderRadius: 50,
    padding: 10,
    marginHorizontal: 10,
  },
  iconText: {
    fontSize: 18,
    color: 'white',
  },
  nextButton: {
    backgroundColor: '#00FF00',
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 8,
    marginBottom: 10,
  },
  nextText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  skipButton: {
    backgroundColor: '#666',
    paddingVertical: 8,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  skipText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
