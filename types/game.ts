import { Player } from "./player";
import { Question } from "./question";

export type GamePlayer = {
    playerInfo: Player;
    skipCount: number;
    difficultyQueue: number[];   // 4 difficulties shuffled
    difficultyIndex: number;     // where in difficultyQueue they currently are
    totalQuestionsAnswered: number; // counts questions for bonus round + skip bonus
};

export type GameState = {
    players: GamePlayer[];
    questions: Question[];         // All available questions
    answeredQuestionIds: number[];      // Track used questions to avoid repeats
    roundPlayersLeft: string[];         // Player IDs left to answer this round
    currentPlayerId: string | null;
    currentQuestion: Question | null;
    roundNumber: number;
    bonusReady: boolean;                // Ready for bonus round (all_players = true)
    existingDifficulties: number[];
};

 export type GameContextType = {
    gameState: GameState | null;
    setGameState: (state: GameState) => void;
  };