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
import { ActivityIndicator, Image, Linking, Pressable, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
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
        const pageSize = 500;
        let from = 0;
        let allQuestions: Question[] = [];

        while (true) {
            const { data, error } = await supabase
                .from('questions')
                .select('*')
                .order('created_at', { ascending: false })
                .range(from, from + pageSize - 1);

            if (error) {
                console.error('Supabase error:', error.message);
                break;
            }

            if (!data || data.length === 0) break;
            allQuestions = allQuestions.concat(data);
            from += pageSize;

            if (from > 5000) break;
        }
        return allQuestions;
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
                    {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#00D9F5" />
          </View>
        )}
        {/* rest of your layout */}
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
                        onPress={(e) => {
                            e.stopPropagation();
                            setSettingsVisible(!settingsVisible);
                        }}
                    >
                        <Ionicons name="settings-outline" size={24} color="#fff" />
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

            {/* Main Content */}
            <View style={styles.mainContent}>
                {/* Players Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Players</Text>
                    <View style={styles.listContainer}>
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.scrollContent}
                            scrollEnabled={true}
                            nestedScrollEnabled={true}
                        >
                            {players.map(item => (
                                <View key={item.id} style={styles.playerCard}>
                                    <Text style={styles.playerName}>{item.name}</Text>
                                    <TouchableOpacity onPress={() => removePlayer(item.id)}>
                                        <Ionicons name="trash-outline" size={20} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </ScrollView>
                    </View>

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
                <View style={[styles.section, { flex: 1 }]}>
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

                    <Pressable onPress={startGame} style={({ pressed }) => [
                        styles.startButton,
                        pressed ? { opacity: 0.8 } : {},
                        players.length < 2 ? { opacity: 0.5 } : {}
                    ]} disabled={players.length < 2}>
                        <LinearGradient
                            colors={['#00F5A0', '#00D9F5']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.startButtonGradient}
                        >
                            <Text style={styles.startButtonText}>Start Game</Text>
                        </LinearGradient>
                    </Pressable>

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
        paddingTop: 35,
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
        paddingTop: 10,
    },
    logo: {
        width: 40,
        height: 40,
        marginRight: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#00F5A0',
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
        color: '#00F5A0',
        fontSize: 16,
        textAlign: 'center',
    },
    section: {
        marginBottom: 20,
    },
    listContainer: {
        height: 220,
        backgroundColor: 'rgba(45, 27, 105, 0.3)',
        borderRadius: 10,
        marginBottom: 35,
        overflow: 'hidden',
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '600',
        color: '#00F5A0',
        marginBottom: 10,
        alignSelf: 'center'
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
        color: '#00F5A0',
        fontSize: 16,
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
        marginBottom: 100,
    },
    modeOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingRight: 10,
        paddingBottom: 10
    },
    modeText: {
        color: '#fff',
        fontSize: 14,
        flex: 1,
    },
    disabledButton: {
        opacity: 0.5,
    },
    scrollContent: {
        paddingVertical: 8,
        paddingHorizontal: 8,
    },
    startButton: {
        borderRadius: 25,
        overflow: 'hidden',
        marginTop: 20,
        bottom: 60,
        left: 5,
        right: 5,
    },
    startButtonGradient: {
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 25,
        alignItems: 'center',
    },
    startButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
      },
});