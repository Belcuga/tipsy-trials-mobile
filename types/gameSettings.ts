    export type GameSettings = {
        adultMode: boolean,
        challenges: boolean,
        questionsPerPlayer: boolean,
    }

    export type SettingsLabel = {
        label: string, 
        tooltip: string, 
        value: 'adultMode' | 'challenges' | 'dirtyMode'
    }