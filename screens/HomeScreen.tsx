import ContactUsModal from '@/components/ContactUsModal';
import HowToPlayModal from '@/components/HowToPlayModal';
import { useGame } from '@/context/GameContext';
import { supabase } from '@/lib/supabase';
import { GamePlayer, GameState } from '@/types/game';
import { Drink, Gender } from '@/types/player';
import { Question } from '@/types/question';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, SafeAreaView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
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
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <Image
                    source={require('../assets/images/logo.png')}
                    style={styles.logo}
                />
                <Text style={styles.title}>Tipsy Trials</Text>
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

            {/* Main Content */}
            <View style={styles.mainContent}>
                {/* Players Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Players</Text>
                    <FlatList
                        data={players}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <View style={styles.playerCard}>
                                <Text style={styles.playerName}>{item.name}</Text>
                                <TouchableOpacity onPress={() => removePlayer(item.id)}>
                                    <Ionicons name="trash-outline" size={20} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        )}
                        style={styles.playerList}
                    />
                    
                    <TouchableOpacity onPress={() => setModalVisible(true)}>
                        <LinearGradient
                            colors={['#00F5A0', '#00D9F5']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.addButton}
                        >
                            <Text style={styles.addButtonText}>Add a Player</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Game Mode Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Choose Your Mode</Text>
                    <View style={styles.modeContainer}>
                        <View style={styles.modeOption}>
                            <Text style={styles.modeText}>Include Spicy Questions (18+)</Text>
                            <Switch
                                value={gameSettings.adultMode}
                                onValueChange={() => toggleSetting('adultMode')}
                                trackColor={{ false: '#3a3a3a', true: '#00F5A0' }}
                                thumbColor={gameSettings.adultMode ? '#fff' : '#f4f3f4'}
                            />
                        </View>
                        <View style={styles.modeOption}>
                            <Text style={styles.modeText}>Include Challenges</Text>
                            <Switch
                                value={gameSettings.challenges}
                                onValueChange={() => toggleSetting('challenges')}
                                trackColor={{ false: '#3a3a3a', true: '#00F5A0' }}
                                thumbColor={gameSettings.challenges ? '#fff' : '#f4f3f4'}
                            />
                        </View>
                        <View style={styles.modeOption}>
                            <Text style={styles.modeText}>Only Spicy Stuff (18+)</Text>
                            <Switch
                                value={gameSettings.dirtyMode}
                                onValueChange={() => toggleSetting('dirtyMode')}
                                trackColor={{ false: '#3a3a3a', true: '#00F5A0' }}
                                thumbColor={gameSettings.dirtyMode ? '#fff' : '#f4f3f4'}
                            />
                        </View>
                    </View>

                    <TouchableOpacity 
                        onPress={startGame}
                        disabled={players.length < 2 || loading}
                    >
                        <LinearGradient
                            colors={['#00F5A0', '#00D9F5']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[styles.startButton, (players.length < 2 || loading) && styles.disabledButton]}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <Text style={styles.startButtonText}>Start Game</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>

            <AddPlayerModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onAdd={(player) => {
                    setPlayers((prev) => [...prev, { ...player, id: Date.now().toString() }]);
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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#1a0b2e',
        paddingTop: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingTop: 30,
        paddingBottom: 30,
        position: 'relative',
    },
    mainContent: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
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
    settingsContainer: {
        position: 'absolute',
        right: 20,
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
    section: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 10,
    },
    playerCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#2D1B69',
        padding: 12,
        borderRadius: 10,
        marginBottom: 8,
    },
    playerName: {
        color: '#fff',
        fontSize: 16,
    },
    playerList: {
        flex: 1,
        marginBottom: 10,
    },
    addButton: {
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    modeContainer: {
        marginBottom: 15,
    },
    modeOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    modeText: {
        color: '#fff',
        fontSize: 14,
        flex: 1,
        paddingRight: 10,
    },
    startButton: {
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    startButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    disabledButton: {
        opacity: 0.5,
    },
});