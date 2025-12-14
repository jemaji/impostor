import React, { useState } from 'react';
import type { GameState } from '../types/game';
import { GameOver } from './game/GameOver';
import { VotingPhase } from './game/VotingPhase';
import { PlayingPhase } from './game/PlayingPhase';

interface Props {
    gameState: GameState;
    myId: string;
    myRole: string;
    isMyTurn: boolean;
    activePlayerName: string;
    isKicked: boolean;
    isHost: boolean;
    theme: 'dark' | 'light';
    onSubmit: (term: string) => void;
    onVote: (targetId: string) => void;
    onRestart: () => void;
    onCloseRoom: () => void;
    onToggleTheme: () => void;
    roundExpiresAt?: number | null;
    votingExpiresAt?: number | null;
    roundTotalTime: number;
    votingTotalTime: number;
    roundTimerEnabled: boolean;
    votingTimerEnabled: boolean;
}

export const GameCanvas: React.FC<Props> = ({
    gameState,
    myId,
    myRole,
    isKicked,
    isHost,
    theme,
    onSubmit,
    onVote,
    onRestart,
    onCloseRoom,
    onToggleTheme,
    roundExpiresAt,
    votingExpiresAt,
    roundTotalTime,
    votingTotalTime,
    roundTimerEnabled,
    votingTimerEnabled
}) => {
    // State for managing expanded rounds in the feed
    const [expandedRound, setExpandedRound] = useState<number | null>(gameState.round || 1);

    // Auto-expand using derived state pattern
    const [prevGameRound, setPrevGameRound] = useState(gameState.round);
    if (gameState.round !== prevGameRound) {
        setPrevGameRound(gameState.round);
        setExpandedRound(gameState.round);
    }

    const toggleRound = (r: number) => {
        setExpandedRound(prev => (prev === r ? null : r));
    };

    // Group inputs by round
    const groupedInputs = gameState.inputs.reduce((acc, input) => {
        const r = input.round || 1;
        if (!acc[r]) acc[r] = [];
        acc[r].push(input);
        return acc;
    }, {} as Record<number, typeof gameState.inputs>);

    const sortedRounds = Object.keys(groupedInputs).map(Number).sort((a, b) => b - a);

    // Render Game Over Screen
    if (gameState.state === 'game_over') {
        return (
            <GameOver
                gameState={gameState}
                theme={theme}
                isHost={isHost}
                onToggleTheme={onToggleTheme}
                onCloseRoom={onCloseRoom}
                onRestart={onRestart}
            />
        );
    }

    // Render Voting or Revealing Screen
    if (gameState.state === 'voting' || gameState.state === 'revealing') {
        return (
            <VotingPhase
                gameState={gameState}
                myId={myId}
                isKicked={isKicked}
                isHost={isHost}
                theme={theme}
                votingTimerEnabled={votingTimerEnabled}
                votingExpiresAt={votingExpiresAt}
                votingTotalTime={votingTotalTime}
                groupedInputs={groupedInputs}
                sortedRounds={sortedRounds}
                expandedRound={expandedRound}
                onToggleRound={toggleRound}
                onVote={onVote}
                onToggleTheme={onToggleTheme}
                onCloseRoom={onCloseRoom}
                onRestart={onRestart}
            />
        );
    }

    // Render Playing Screen (Default)
    return (
        <PlayingPhase
            gameState={gameState}
            myId={myId}
            myRole={myRole}
            isKicked={isKicked}
            isHost={isHost}
            theme={theme}
            roundTimerEnabled={roundTimerEnabled}
            roundExpiresAt={roundExpiresAt}
            roundTotalTime={roundTotalTime}
            groupedInputs={groupedInputs}
            sortedRounds={sortedRounds}
            expandedRound={expandedRound}
            onToggleRound={toggleRound}
            onSubmit={onSubmit}
            onToggleTheme={onToggleTheme}
            onCloseRoom={onCloseRoom}
            onRestart={onRestart}
        />
    );
};
