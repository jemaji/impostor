import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { getRandomWord } from './dictionary.js';
import { PUNISHMENTS } from './punishments.js';
import { SHAME_PHRASES } from './shame_phrases.js';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*", // Allow all for local dev simplicity
        methods: ["GET", "POST"]
    }
});

// State
const rooms = {}; // { [roomCode]: { players: [], state: 'lobby'|'playing', word: string, impostorIndex: number, turnIndex: number, inputs: [] } }

const getSafeRoomState = (room) => {
    const { roundTimer, votingTimer, turnTimer, ...safeRoom } = room;
    return safeRoom;
};

const generateCode = () => Math.random().toString(36).substring(2, 6).toUpperCase();

// Turn timer removed for simultaneous writing


const startRoundTimer = (room, code, io) => {
    if (room.roundTimer) clearTimeout(room.roundTimer);

    if (room.state !== 'playing' || !room.settings?.roundTimer) {
        room.roundExpiresAt = null;
        return;
    }

    const duration = (room.settings.roundTimeLimit || 60) * 1000;
    room.roundExpiresAt = Date.now() + duration;

    io.to(code).emit('room_update', getSafeRoomState(room));

    room.roundTimer = setTimeout(() => {
        handleRoundTimeout(room, code, io);
    }, duration);
};

const handleRoundTimeout = (room, code, io) => {
    // Safety check: ensure room still exists in global state
    if (!rooms[code]) return;

    if (room.state !== 'playing') return;

    console.log(`Global Round Timeout for room ${code}`);

    // Find players who haven't submitted yet
    const submittedPlayerNames = room.inputs.map(i => i.playerName);
    const activePlayers = room.players.filter(p => !room.kickedIds.includes(p.id));

    activePlayers.forEach(player => {
        if (!submittedPlayerNames.includes(player.name)) {
            // Apply punishment logic or shame phrase
            if (room.settings?.punishment) {
                const punishment = PUNISHMENTS[Math.floor(Math.random() * PUNISHMENTS.length)];
                const punishmentTerm = `🤡 CASTIGO: ${punishment}`;
                processSubmission(room, code, io, player.name, punishmentTerm, true);
            } else {
                const phrase = SHAME_PHRASES[Math.floor(Math.random() * SHAME_PHRASES.length)];
                const shameTerm = `😳 "${phrase}"`;
                processSubmission(room, code, io, player.name, shameTerm, true);
            }
        }
    });
};

const startVotingTimer = (room, code, io) => {
    if (room.votingTimer) clearTimeout(room.votingTimer);

    if (room.state !== 'voting' || !room.settings?.votingTimer) {
        room.votingExpiresAt = null;
        return;
    }

    const duration = (room.settings.votingTimeLimit || 30) * 1000;
    room.votingExpiresAt = Date.now() + duration;

    io.to(code).emit('room_update', getSafeRoomState(room));

    room.votingTimer = setTimeout(() => {
        handleVotingTimeout(room, code, io);
    }, duration);
};

const handleVotingTimeout = (room, code, io) => {
    if (room.state !== 'voting') return;

    console.log(`Voting Timeout for room ${code}`);

    // Force tally votes
    tallyVotes(room, code, io);
};

const handleTurnTimeout = (room, code, io) => {
    // Deprecated for simultaneous writing
};

const processSubmission = (room, code, io, playerName, term, isAuto = false) => {
    room.inputs.push({ playerName, term, round: room.round });

    if (room.turnTimer) clearTimeout(room.turnTimer);
    room.turnExpiresAt = null;

    // Simultaneous writing: no turn index update needed

    const activePlayers = room.players.filter(p => !room.kickedIds.includes(p.id));
    // Count unique players who have submitted
    const submittedPlayers = new Set(room.inputs.map(i => i.playerName));

    if (submittedPlayers.size >= activePlayers.length) {
        if (room.roundTimer) clearTimeout(room.roundTimer);
        room.roundExpiresAt = null;

        room.state = 'voting';
        room.votes = {};
        room.ghostVotes = {}; // Reset ghost votes for new voting round
        room.inputsInCurrentRound = 0;
        io.to(code).emit('room_update', getSafeRoomState(room));
        startVotingTimer(room, code, io);
    } else {
        // Just update state so others see "Waiting..."
        io.to(code).emit('room_update', getSafeRoomState(room));
    }
};

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('create_room', (data, callback) => {
        console.log('CREATE ROOM DATA:', data); // Debug log
        const code = generateCode();
        rooms[code] = {
            code,
            players: [{
                id: socket.id,
                userId: data.userId, // Store persistent ID
                name: data.name,
                isHost: true,
                color: data.color || '#6d28d9',
                avatar: data.avatar || '👤'
            }],
            state: 'lobby',
            difficulty: 'normal', // Default difficulty
            category: null, // null = Mix parameters
            word: '',
            impostorWord: '', // For hard mode
            impostorIds: [],
            turnIndex: 0,
            round: 1,
            inputs: [], // { playerName: string, term: string }
            kickedIds: [],
            votes: {},
            ghostVotes: {},
            winner: null,
            currentPunishment: null,
            inputsInCurrentRound: 0,
            settings: {
                timer: false,
                timeLimit: 10,
                punishment: false,
                customPunishment: '',
                roundTimer: false,
                roundTimeLimit: 60,
                votingTimer: false,
                votingTimeLimit: 30
            }
        };
        socket.join(code);
        callback({ code });
        io.to(code).emit('room_update', getSafeRoomState(rooms[code]));
    });

    socket.on('join_room', (data, callback) => {
        console.log('JOIN ROOM DATA:', data); // Debug log
        const room = rooms[data.code];
        if (!room) return callback({ error: 'Sala no encontrada' });

        // RECONNECTION LOGIC
        const existingPlayer = room.players.find(p => p.userId === data.userId);
        if (existingPlayer) {
            const oldSocketId = existingPlayer.id;
            console.log(`Player ${existingPlayer.name} reconnected (Socket: ${oldSocketId} -> ${socket.id}). Updating data.`);

            existingPlayer.id = socket.id; // Update socket ID
            existingPlayer.disconnected = false; // Mark as reconnected
            delete existingPlayer.disconnectedAt;

            // UPDATE REFERENCES IN GAME STATE
            // 1. Impostor IDs
            if (room.impostorIds.includes(oldSocketId)) {
                room.impostorIds = room.impostorIds.map(id => id === oldSocketId ? socket.id : id);
            }
            // 2. Kicked IDs
            if (room.kickedIds.includes(oldSocketId)) {
                room.kickedIds = room.kickedIds.map(id => id === oldSocketId ? socket.id : id);
            }
            // 3. Votes (both keys (voter) and values (target))
            // Update keys: create new object
            const newVotes = {};
            for (const voterId in room.votes) {
                const targetId = room.votes[voterId];
                const newVoterId = voterId === oldSocketId ? socket.id : voterId;
                const newTargetId = targetId === oldSocketId ? socket.id : targetId;
                newVotes[newVoterId] = newTargetId;
            }
            room.votes = newVotes;

            // 4. Ghost Votes
            const newGhostVotes = {};
            for (const voterId in room.ghostVotes) {
                const targetId = room.ghostVotes[voterId];
                const newVoterId = voterId === oldSocketId ? socket.id : voterId;
                const newTargetId = targetId === oldSocketId ? socket.id : targetId;
                newGhostVotes[newVoterId] = newTargetId;
            }
            room.ghostVotes = newGhostVotes;

            // Update metadata if provided
            if (data.name) existingPlayer.name = data.name;
            if (data.color) existingPlayer.color = data.color;
            if (data.avatar) existingPlayer.avatar = data.avatar;

            socket.join(data.code);

            // Check if game can be unpaused
            const activePlayers = room.players.filter(p =>
                !p.disconnected && !room.kickedIds.includes(p.id)
            );
            if (room.paused && activePlayers.length >= 3) {
                room.paused = false;
                delete room.pauseReason;
            }

            callback({ success: true });
            io.to(data.code).emit('room_update', getSafeRoomState(room));
            return;
        }

        if (room.state !== 'lobby') return callback({ error: 'Partida ya empezada' });

        // Check if name is taken? Optional but good.
        // For now just push.
        room.players.push({
            id: socket.id,
            userId: data.userId,
            name: data.name,
            isHost: false,
            color: data.color || '#6d28d9',
            avatar: data.avatar || '👤'
        });
        socket.join(data.code);
        callback({ success: true });
        io.to(data.code).emit('room_update', getSafeRoomState(room));
    });

    socket.on('set_difficulty', (data) => {
        const room = rooms[data.code];
        if (!room || room.state !== 'lobby') return;

        room.difficulty = data.difficulty;
        io.to(data.code).emit('room_update', getSafeRoomState(room));
    });

    socket.on('set_category', (data) => {
        const room = rooms[data.code];
        if (!room || room.state !== 'lobby') return;

        room.category = data.category;
        io.to(data.code).emit('room_update', getSafeRoomState(room));
    });

    socket.on('update_settings', (data) => {
        const room = rooms[data.code];
        if (!room || room.state !== 'lobby') return;

        room.settings = { ...room.settings, ...data.settings };
        io.to(data.code).emit('room_update', getSafeRoomState(room));
    });

    socket.on('start_game', (data) => {
        const room = rooms[data.code];
        if (!room) return;

        // Setup game
        const playerCount = room.players.length;
        let impostorCount = 1;
        if (playerCount >= 6) impostorCount = 2;
        if (playerCount >= 9) impostorCount = 3;
        if (playerCount >= 12) impostorCount = 4;

        room.state = 'playing';

        // Assign words based on category and difficulty
        const pair = getRandomWord(room.category);

        if (room.difficulty === 'hard') {
            // Hard mode: use related words
            room.word = pair.word;
            room.impostorWord = pair.related;

            // Randomly swap so word/related aren't always in same role order (optional but good)
            if (Math.random() > 0.5) {
                [room.word, room.impostorWord] = [room.impostorWord, room.word];
            }
        } else {
            // Normal mode: only civilians get word (pick random one from pair for variety)
            room.word = Math.random() > 0.5 ? pair.word : pair.related;
            room.impostorWord = '';
        }

        // Assign Impostors
        const indices = Array.from({ length: playerCount }, (_, i) => i);
        room.impostorIds = [];
        for (let i = 0; i < impostorCount; i++) {
            const rand = Math.floor(Math.random() * indices.length);
            const idx = indices.splice(rand, 1)[0];
            room.impostorIds.push(room.players[idx].id);
        }

        room.turnIndex = -1; // Simultaneous writing
        room.round = 1;
        room.inputs = [];
        room.votes = {}; // { [voterId]:  targetId | 'skip' }
        room.ghostVotes = {};
        room.kickedIds = []; // Array of ids
        room.winner = null; // 'impostors' | 'civilians'
        room.inputsInCurrentRound = 0;

        io.to(data.code).emit('game_started', getSafeRoomState(room));
        startRoundTimer(room, data.code, io);
    });

    socket.on('submit_term', (data) => {
        const room = rooms[data.code];
        if (!room) return;
        processSubmission(room, data.code, io, data.playerName, data.term);
    });

    socket.on('vote', (data) => {
        const room = rooms[data.code];
        if (!room || room.state !== 'voting') return;

        room.votes[socket.id] = data.targetId; // targetId or 'skip'

        const activePlayers = room.players.filter(p => !room.kickedIds.includes(p.id));
        const voteCount = Object.keys(room.votes).length;

        if (voteCount >= activePlayers.length) {
            tallyVotes(room, data.code, io);
        } else {
            io.to(data.code).emit('room_update', getSafeRoomState(room));
        }
    });

    const tallyVotes = (room, code, io) => {
        if (room.votingTimer) clearTimeout(room.votingTimer);
        room.votingExpiresAt = null;

        // Transition to revealing state instead of immediate tally
        room.state = 'revealing';
        io.to(code).emit('room_update', getSafeRoomState(room));

        // 5 seconds to reveal votes
        setTimeout(() => {
            finalizeVoting(room, code, io);
        }, 5000);
    };

    const finalizeVoting = (room, code, io) => {
        // Tally votes
        const counts = {};
        for (const vid in room.votes) {
            const target = room.votes[vid];
            counts[target] = (counts[target] || 0) + 1;
        }

        let maxVotes = 0;
        let candidate = null;
        let tie = false;

        for (const target in counts) {
            if (counts[target] > maxVotes) {
                maxVotes = counts[target];
                candidate = target;
                tie = false;
            } else if (counts[target] === maxVotes) {
                tie = true;
            }
        }

        if (!tie && candidate && candidate !== 'skip') {
            room.kickedIds.push(candidate);

            // Check Win Conditions
            const impostorsLeft = room.impostorIds.filter(id => !room.kickedIds.includes(id)).length;
            const civiliansLeft = room.players.filter(p => !room.impostorIds.includes(p.id) && !room.kickedIds.includes(p.id)).length;

            if (impostorsLeft === 0) {
                room.state = 'game_over';
                room.winner = 'civilians';
            } else if (impostorsLeft >= civiliansLeft) {
                room.state = 'game_over';
                room.winner = 'impostors';
            }

            if (room.state === 'game_over') {
                // Assign punishment if enabled
                if (room.settings?.punishment) {
                    room.currentPunishment = PUNISHMENTS[Math.floor(Math.random() * PUNISHMENTS.length)];
                }
            } else {
                // Continue Playing
                room.state = 'playing';
                room.round++;
            }
        } else {
            // Tie or Skip
            room.state = 'playing';
            room.round++;
        }

        if (room.state === 'playing') {
            // Simultaneous writing: just reset inputs for next round
            room.inputs = [];
            io.to(code).emit('room_update', getSafeRoomState(room));
            startRoundTimer(room, code, io);
        } else {
            io.to(code).emit('room_update', getSafeRoomState(room));
        }
    };

    socket.on('ghost_vote', (data) => {
        const room = rooms[data.code];
        if (!room || room.state !== 'voting') return;
        // Verify sender is a ghost (kicked player)
        if (!room.kickedIds.includes(socket.id)) return;

        room.ghostVotes[socket.id] = data.targetId;
        io.to(data.code).emit('room_update', getSafeRoomState(room));
    });

    socket.on('restart_game', (data) => {
        const room = rooms[data.code];
        if (!room) return;
        room.state = 'lobby';
        room.inputs = [];
        room.votes = {};
        room.ghostVotes = {};
        room.kickedIds = [];
        room.winner = null;
        room.currentPunishment = null;
        room.impostorIds = [];
        room.inputsInCurrentRound = 0;
        if (room.turnTimer) clearTimeout(room.turnTimer);
        if (room.roundTimer) clearTimeout(room.roundTimer);
        if (room.votingTimer) clearTimeout(room.votingTimer);
        room.turnExpiresAt = null;
        room.roundExpiresAt = null;
        room.votingExpiresAt = null;
        io.to(data.code).emit('room_update', getSafeRoomState(room));
    });

    socket.on('ghost_action', (data) => {
        const room = rooms[data.code];
        if (!room) return;
        // Broadcast the reaction to everyone in the room
        io.to(data.code).emit('ghost_reaction', {
            emoji: data.emoji,
            fromId: socket.id
        });
    });

    socket.on('leave_room', (data) => {
        const room = rooms[data.code];
        if (!room) return;

        if (data.isHost) {
            // Host is leaving - close the room for everyone
            io.to(data.code).emit('room_closed');
            if (room.turnTimer) clearTimeout(room.turnTimer);
            delete rooms[data.code];
        } else {
            // Regular player leaving - just remove them
            const playerIndex = room.players.findIndex(p => p.id === socket.id);
            if (playerIndex !== -1) {
                room.players.splice(playerIndex, 1);

                // If no players left, delete room
                if (room.players.length === 0) {
                    if (room.turnTimer) clearTimeout(room.turnTimer);
                    delete rooms[data.code];
                } else {
                    // Assign new host if needed
                    const hasHost = room.players.some(p => p.isHost);
                    if (!hasHost && room.players.length > 0) {
                        room.players[0].isHost = true;
                    }
                    io.to(data.code).emit('room_update', getSafeRoomState(room));
                }
            }
        }
    });

    socket.on('disconnect', () => {
        // Mark player as disconnected instead of removing (allow reconnection)
        for (const code in rooms) {
            const room = rooms[code];
            const player = room.players.find(p => p.id === socket.id);
            if (player) {
                player.disconnected = true;
                player.disconnectedAt = Date.now();

                // If disconnected player was host, transfer to another connected player
                if (player.isHost) {
                    player.isHost = false;
                    const newHost = room.players.find(p => !p.disconnected && p.id !== socket.id);
                    if (newHost) {
                        newHost.isHost = true;
                        console.log(`Host transferred from ${player.name} to ${newHost.name}`);
                    }
                }

                // Count active (non-kicked, non-disconnected) players
                const activePlayers = room.players.filter(p =>
                    !p.disconnected && !room.kickedIds.includes(p.id)
                );

                // If only 1 or 0 active players, close the room
                if (activePlayers.length <= 1) {
                    console.log(`Room ${code} closing - only ${activePlayers.length} active player(s)`);
                    io.to(code).emit('room_closed');
                    if (room.turnTimer) clearTimeout(room.turnTimer);
                    delete rooms[code];
                    return;
                }

                // If game is in progress and less than 3 active players, pause
                if ((room.state === 'playing' || room.state === 'voting') && activePlayers.length < 3) {
                    room.paused = true;
                    room.pauseReason = 'Esperando reconexión de jugadores... (mínimo 3 jugadores)';
                }

                // Notify host if players disconnected
                const host = room.players.find(p => p.isHost);
                if (host && activePlayers.length < room.players.filter(p => !room.kickedIds.includes(p.id)).length) {
                    io.to(host.id).emit('player_disconnected', {
                        playerName: player.name,
                        activePlayers: activePlayers.length
                    });
                }

                io.to(code).emit('room_update', getSafeRoomState(room));

                // Clean up completely disconnected rooms after 5 minutes
                setTimeout(() => {
                    const currentRoom = rooms[code];
                    if (currentRoom) {
                        const allDisconnected = currentRoom.players.every(p => p.disconnected);
                        if (allDisconnected) {
                            if (currentRoom.turnTimer) clearTimeout(currentRoom.turnTimer);
                            delete rooms[code];
                        }
                    }
                }, 5 * 60 * 1000);
            }
        }
    });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
