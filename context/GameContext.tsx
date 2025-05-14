import { GameContextType, GameState } from '@/types/game';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

type ExtendedGameContextType = GameContextType & {
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const GameContext = createContext<ExtendedGameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);

  useEffect(() => {
    const loadGameState = async () => {
      try {
        const saved = await AsyncStorage.getItem('party-game-state');
        if (saved) {
          setGameState(JSON.parse(saved));
        }
      } catch (err) {
        console.error('Failed to load game state from AsyncStorage:', err);
      }
    };

    loadGameState();
  }, []);

  useEffect(() => {
    const saveGameState = async () => {
      try {
        if (gameState) {
          await AsyncStorage.setItem('party-game-state', JSON.stringify(gameState));
        }
      } catch (err) {
        console.error('Failed to save game state to AsyncStorage:', err);
      }
    };

    saveGameState();
  }, [gameState]);

  return (
    <GameContext.Provider value={{ gameState, setGameState, loading, setLoading }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}