export type Question = {
    id: number;
    created_at: string;
    question: string;
    dirty: boolean;
    challenge: boolean;
    punishment: number;
    like_count: number;
    dislike_count: number;
    difficulty: number;
    all_players: boolean;
    need_opposite_gender: boolean;
};