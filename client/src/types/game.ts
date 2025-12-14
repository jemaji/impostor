export interface Player {
    id: string;
    name: string;
    color?: string;
    avatar?: string;
    disconnected?: boolean;
}

export interface Input {
    playerName: string;
    term: string;
    round?: number;
}

export interface GameSettings {
    punishment: boolean;
    customPunishment: string;
    roundTimer: boolean;
    roundTimeLimit: number;
    votingTimer: boolean;
    votingTimeLimit: number;
}

export interface GameState {
    code: string;
    players: Player[];
    state: 'lobby' | 'playing' | 'voting' | 'revealing' | 'game_over';
    difficulty: 'normal' | 'hard';
    word: string;
    impostorWord: string;
    impostorIds: string[];
    turnIndex: number;
    round: number;
    inputs: Input[];
    votes: Record<string, string>;
    ghostVotes?: Record<string, string>;
    kickedIds: string[];
    winner: 'civilians' | 'impostors' | null;
    paused?: boolean;
    pauseReason?: string;
    roundExpiresAt?: number | null;
    votingExpiresAt?: number | null;
    settings?: GameSettings;
    currentPunishment?: string | null;
}

export const GHOST_EMOJIS = ['👻', '💩', '🤮', '💀', '🤡', '🤥', '👏', '🤣', '😡', '🥶', '❤️', '👀'];
