import ContactUsModal from '@/components/ContactUsModal';
import HowToPlayModal from '@/components/HowToPlayModal';
import { useGame } from '@/context/GameContext';
import { supabase } from '@/lib/supabase';
import { GamePlayer, GameState } from '@/types/game';
import { Drink, Gender } from '@/types/player';
import { Question } from '@/types/question';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import AddPlayerModal from '../components/AddPlayerModal';

interface Player {
    id: string;
    name: string;
    gender: string;
    drink: string;
    single: boolean;
}

export default function HomeScreen() {
    const [modalVisible, setModalVisible] = useState(false);
    const [players, setPlayers] = useState<Player[]>([]);
    const [gameSettings, setGameSettings] = useState({
        adultMode: false,
        challenges: false,
        dirtyMode: false,
    });
    const [settingsVisible, setSettingsVisible] = useState(false);
    const [howToPlayVisible, setHowToPlayVisible] = useState(false);
    const [contactVisible, setContactVisible] = useState(false);

    const { gameState, setGameState, loading, setLoading } = useGame();

    const fetchAllQuestions = async (): Promise<Question[]> => {
        const pageSize = 1000;
        let from = 0;
        let moreData = true;
        const questionMap = new Map<string, Question>();

        while (moreData) {
            const to = from + pageSize - 1;

            const { data, error } = await supabase
                .from('questions')
                .select('*')
                .range(from, to)
                .order('created_at', { ascending: false })
                .order('id', { ascending: false });

            if (error) {
                console.error('Failed to fetch questions:', error.message);
                break;
            }

            if (data && data.length > 0) {
                data.forEach((q) => questionMap.set(q.id, q));
                from += pageSize;
            } else {
                moreData = false;
            }
        }

        return Array.from(questionMap.values());
    };

    useEffect(() => {
        async function loadPlayers() {
            const savedPlayers = await AsyncStorage.getItem('tipsyPlayers');
            if (savedPlayers) {
                try {
                    const parsed: Player[] = JSON.parse(savedPlayers);
                    if (Array.isArray(parsed)) setPlayers(parsed);
                } catch (err) {
                    console.error('Failed to parse saved players:', err);
                }
            }
        }
        loadPlayers();
    }, []);

    useEffect(() => {
        if (players.length > 0) {
            AsyncStorage.setItem('tipsyPlayers', JSON.stringify(players));
        }
    }, [players]);

    const toggleSetting = (key: keyof typeof gameSettings) => {
        setGameSettings((prev) => ({
            ...prev,
            [key]: !prev[key],
            ...(key === 'dirtyMode' ? { adultMode: false, challenges: false } : { dirtyMode: false }),
        }));
    };

    const startGame = async () => {
        if (players.length < 2) return;

        setLoading(true);

        const questionMap = new Map();

        const data = await fetchAllQuestions()

        if (data && data.length > 0) {
            data.forEach((q) => questionMap.set(q.id, q));
        }

        const allQuestions = Array.from(questionMap.values());
        const filteredQuestions = allQuestions.filter((q: Question) => {
            if (gameSettings.dirtyMode) {
                if (q.dirty) return true;
                return false;
            }
            else {
                if (!gameSettings.adultMode && q.dirty) return false;
                if (!gameSettings.challenges && q.challenge) return false;
                return true;
            }
        });
        const existingDifficulties = [...new Set(filteredQuestions.map(q => q.difficulty))];

        const initializedPlayers = players.map((p) => ({
            playerInfo: {
                id: String(p.id),
                name: p.name,
                gender: p.gender,
                drink: p.drink,
                single: p.single
            },
            skipCount: 1,
            difficultyQueue: shuffleArray(existingDifficulties),
            difficultyIndex: 0,
            totalQuestionsAnswered: 0,
        } as GamePlayer));

        initializedPlayers.push({
            playerInfo: {
                id: String(0),
                name: 'All players',
                gender: Gender.None,
                drink: Drink.None,
                single: false,
            },
            skipCount: 0,
            difficultyQueue: [],
            difficultyIndex: 0,
            totalQuestionsAnswered: 0,
        } as GamePlayer);

        const gameState: GameState = {
            players: initializedPlayers,
            questions: filteredQuestions,
            answeredQuestionIds: [],
            roundPlayersLeft: initializedPlayers.map(p => p.playerInfo.id),
            currentPlayerId: null,
            currentQuestion: null,
            roundNumber: 1,
            bonusReady: false,
            existingDifficulties: existingDifficulties
        };

        setGameState(gameState);
        router.push('/game' as any);
    };

    function shuffleArray<T>(array: T[]): T[] {
        return [...array].sort(() => Math.random() - 0.5);
    }


    const removePlayer = (id: string) => {
        setPlayers((prev) => prev.filter((player) => player.id !== id));
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Image
                    source={require('../assets/images/logo.png')}
                    style={styles.logo}
                />
                <Text style={styles.title}>Tipsy Trials</Text>
                <TouchableOpacity
                    style={styles.settingsBtn}
                    onPress={() => setSettingsVisible(!settingsVisible)}
                >
                    <Text style={styles.settingsIcon}>⚙️</Text>
                </TouchableOpacity>
                {settingsVisible && (
                    <View style={styles.dropdown}>
                        <TouchableOpacity onPress={() => {
                            setSettingsVisible(false);
                            setHowToPlayVisible(true);
                        }}>
                            <Text style={styles.dropdownText}>How to Play</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => {
                            setSettingsVisible(false);
                            setContactVisible(true);
                        }}>
                            <Text style={styles.dropdownText}>Contact Us</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Players Section */}
            <Text style={styles.sectionTitle}>Players</Text>
            <FlatList
                data={players}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.playerItem}>
                        <Text style={styles.playerName}>{item.name}</Text>
                        <TouchableOpacity onPress={() => removePlayer(item.id)}>
                            <Text style={styles.deleteIcon}>🗑️</Text>
                        </TouchableOpacity>
                    </View>
                )}
                style={styles.playersList}
            />
            <TouchableOpacity style={styles.addPlayerBtn} onPress={() => setModalVisible(true)}>
                <Text style={styles.addPlayerText}>Add Player</Text>
            </TouchableOpacity>

            {/* Mode Section */}
            <View style={styles.bottomSection}>
                <Text style={styles.sectionTitle}>Choose Your Mode</Text>
                <View style={styles.switchBox}>
                    <Text style={styles.switchLabel}>Include Spicy Questions (18+)</Text>
                    <Switch
                        value={gameSettings.adultMode}
                        onValueChange={() => toggleSetting('adultMode')}
                    />
                </View>
                <View style={styles.switchBox}>
                    <Text style={styles.switchLabel}>Include Challenges</Text>
                    <Switch
                        value={gameSettings.challenges}
                        onValueChange={() => toggleSetting('challenges')}
                    />
                </View>
                <View style={styles.switchBox}>
                    <Text style={styles.switchLabel}>Only Spicy Stuff (18+)</Text>
                    <Switch
                        value={gameSettings.dirtyMode}
                        onValueChange={() => toggleSetting('dirtyMode')}
                    />
                </View>

                <TouchableOpacity style={styles.startBtn} onPress={startGame}>
                    <Text style={styles.startText}>Start Game</Text>
                </TouchableOpacity>
            </View>
            <AddPlayerModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onAdd={(player) => {
                    setPlayers((prev) => [...prev, { id: Date.now().toString(), ...player }]);
                    setModalVisible(false);
                }}
            />
            <HowToPlayModal
                visible={howToPlayVisible}
                onClose={() => setHowToPlayVisible(false)}
            />
            <ContactUsModal
                visible={contactVisible}
                onClose={() => setContactVisible(false)}
            />
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
    logo: {
        width: 40,
        height: 40,
        marginRight: 10,
    },
    title: {
        fontSize: 28,
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
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        marginVertical: 10,
    },
    addPlayerBtn: {
        backgroundColor: '#00FF00',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
        marginBottom: 20,
    },
    addPlayerText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    bottomSection: {
        position: 'absolute',
        bottom: 30,
        width: '100%',
        alignItems: 'center',
    },
    switchBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderRadius: 8,
        width: '100%',
        marginBottom: 5, // ⬅️ smaller gap
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    switchLabel: {
        flex: 1,
        fontSize: 14,
        marginRight: 10,
        color: 'white'
    },
    startBtn: {
        backgroundColor: '#00FF00',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 8,
        marginTop: 20,
    },
    startText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    dropdown: {
        position: 'absolute',
        top: 60,
        right: 10,
        backgroundColor: 'white',
        borderRadius: 8,
        elevation: 5,
        paddingVertical: 10,
        width: 150,
        zIndex: 100,
    },
    dropdownItem: {
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    dropdownText: {
        fontSize: 16,
        color: '#333',
    },
    playerItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
        width: '100%',
        alignItems: 'center',
    },
    playerName: {
        fontSize: 16,
        color: '#333',
    },
    deleteIcon: {
        fontSize: 18,
        color: 'red',
    },
    playersList: {
        width: '100%',
        maxHeight: 300,
    },
});