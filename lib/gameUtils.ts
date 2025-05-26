import { GamePlayer, GameState } from '@/types/game';
import { Drink } from '@/types/player';
import { Question } from '@/types/question';

export function pickNextPlayer(state: GameState): string {
  const available = state.roundPlayersLeft;
  const randomIndex = Math.floor(Math.random() * available.length);
  return available[randomIndex];
}

export function pickNextQuestion(playerId: string, state: GameState): Question {
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

export function replacePlayerPlaceholder(question: string, state: GameState, currentPlayerId: string): string {
  const PLACEHOLDER = '${player}';

  if (!question.includes(PLACEHOLDER)) return question;

  const currentPlayer = state.players.find(p => p.playerInfo.id === currentPlayerId);
  if (!currentPlayer) return question;

  const otherPlayers = state.players.filter(
    p => p.playerInfo.id !== currentPlayerId &&
      p.playerInfo.gender !== currentPlayer.playerInfo.gender &&
      p.playerInfo.single &&
      p.playerInfo.id !== '0'
  );

  const placeholderCount = (question.match(/\$\{player\}/g) || []).length;
  if (otherPlayers.length === 0) return question;

  const shuffled = [...otherPlayers].sort(() => Math.random() - 0.5);
  const pickedPlayers = shuffled.slice(0, placeholderCount);

  let replaced = question;
  for (let i = 0; i < placeholderCount; i++) {
    const name = pickedPlayers[i % pickedPlayers.length].playerInfo.name;
    replaced = replaced.replace(PLACEHOLDER, name);
  }

  return replaced;
}

export function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

export function showNumberOfSips(gameState: GameState, currentPlayer: GamePlayer | undefined ) {
  if(!currentPlayer){
    return [];
  }
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
    else if (gameState.currentQuestion.question.includes(`Who's`)) {
      sips.unshift('The person with most votes, if they are:')
    }
    return sips;
  }
  const multiplier =
    currentPlayer?.playerInfo.drink === Drink.Beer
      ? 1.5
      : currentPlayer?.playerInfo.drink === Drink.Wine
        ? 1
        : 0.5;
  const sips = Math.ceil((gameState?.currentQuestion?.punishment ?? 0) * multiplier);
  const sipsText = gameState?.currentQuestion?.challenge ? [`Do or take ${sips} sips`] : [`Answer or take ${sips} sips`]
  return sipsText;
}