import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { getRandomWord } from './dictionary.js';

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

const generateCode = () => Math.random().toString(36).substring(2, 6).toUpperCase();

const PUNISHMENTS = [
    "Soy tonto", "Me huelen los pies", "Me gusta comer mocos",
    "Soy un bebé llorón", "No sé jugar", "Mis pedos huelen mal",
    "Ayer me hice pis", "Quiero a mi mamá", "Soy un gallina",
    "Me he tirado un pedo", "Tengo miedo", "Soy un perdedor"
];

// Helper to process submission and advance turn
function processSubmission(room, playerName, term, io) {
    // Clear existing timer if any
    if (room.timerId) {
        clearTimeout(room.timerId);
        room.timerId = null;
        room.turnExpiresAt = null;
    }

    room.inputs.push({ playerName, term });

    // Find next active player
    let nextIndex = (room.turnIndex + 1) % room.players.length;
    let loops = 0;
    while (room.kickedIds.includes(room.players[nextIndex].id) && loops < room.players.length) {
        nextIndex = (nextIndex + 1) % room.players.length;
        loops++;
    }
    room.turnIndex = nextIndex;

    // Check if round finished
    const activePlayers = room.players.filter(p => !room.kickedIds.includes(p.id));
    room.inputsInCurrentRound++;

    if (room.inputsInCurrentRound >= activePlayers.length) {
        room.state = 'voting';
        room.votes = {};
        room.inputsInCurrentRound = 0;
        room.timerId = null;
        room.turnExpiresAt = null;
    } else {
        // Start timer for next player if enabled
        startTurnTimer(room, io);
    }
    io.to(room.code).emit('room_update', room);
}

function startTurnTimer(room, io) {
    if (!room.settings?.timer) return;
    if (room.state !== 'playing') return;

    if (room.timerId) clearTimeout(room.timerId);

    const timeLimitMs = room.settings.timeLimit * 1000;
    room.turnExpiresAt = Date.now() + timeLimitMs;

    room.timerId = setTimeout(() => {
        handleTurnTimeout(room, io);
    }, timeLimitMs);
}

function handleTurnTimeout(room, io) {
    const currentPlayer = room.players[room.turnIndex];
    if (!currentPlayer) return;

    let term = "...";
    if (!room.settings.punishment) {
        const noPunishmentOptions = ["...", "ZzZ me duermo", "No sé qué decir", "Tiempo agotado"];
        term = noPunishmentOptions[Math.floor(Math.random() * noPunishmentOptions.length)];
    } else {
        term = PUNISHMENTS[Math.floor(Math.random() * PUNISHMENTS.length)];
    }

    console.log(`Time expired for ${currentPlayer.name}, submitting: ${term}`);
    processSubmission(room, currentPlayer.name, term, io);
}

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
            settings: {
                timer: false,
                timeLimit: 15,
                punishment: false,
                customPunishment: 'Soy tonto'
            },
            word: '',
            impostorWord: '', // For hard mode
            impostorIds: [],
            turnIndex: 0,
            inputs: [], // { playerName: string, term: string }
            kickedIds: [],
            votes: {},
            winner: null,
            inputsInCurrentRound: 0,
            turnExpiresAt: null,
            timerId: null
        };
        socket.join(code);
        callback({ code });
        io.to(code).emit('room_update', rooms[code]);
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
            io.to(data.code).emit('room_update', room);
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
        io.to(data.code).emit('room_update', room);
    });

    socket.on('set_difficulty', (data) => {
        const room = rooms[data.code];
        if (!room || room.state !== 'lobby') return;

        room.difficulty = data.difficulty;
        io.to(data.code).emit('room_update', room);
    });

    socket.on('set_category', (data) => {
        const room = rooms[data.code];
        if (!room || room.state !== 'lobby') return;

        room.category = data.category;
        io.to(data.code).emit('room_update', room);
    });

    socket.on('update_settings', (data) => {
        const room = rooms[data.code];
        if (!room || room.state !== 'lobby') return;
        if (data.settings) {
            room.settings = { ...room.settings, ...data.settings };
        }
        io.to(data.code).emit('room_update', room);
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

        room.turnIndex = Math.floor(Math.random() * playerCount);
        room.inputs = [];
        room.votes = {}; // { [voterId]:  targetId | 'skip' }
        room.kickedIds = []; // Array of ids
        room.winner = null; // 'impostors' | 'civilians'
        room.inputsInCurrentRound = 0;

        io.to(data.code).emit('game_started', room);

        // Start timer for first player
        startTurnTimer(room, io);
        io.to(data.code).emit('room_update', room); // Send initial timber info
    });

    socket.on('submit_term', (data) => {
        const room = rooms[data.code];
        if (!room) return;
        processSubmission(room, data.playerName, data.term, io);
    });

    socket.on('vote', (data) => {
        const room = rooms[data.code];
        if (!room || room.state !== 'voting') return;

        room.votes[socket.id] = data.targetId; // targetId or 'skip'

        const activePlayers = room.players.filter(p => !room.kickedIds.includes(p.id));
        const voteCount = Object.keys(room.votes).length;

        if (voteCount >= activePlayers.length) {
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
                } else {
                    room.state = 'playing';
                }
            } else {
                // Tie or Skip
                room.state = 'playing';
            }

            if (room.state === 'playing') {
                // Don't reset turnIndex - maintain the circular order
                // Just ensure current turn player is active
                let loops = 0;
                while (room.kickedIds.includes(room.players[room.turnIndex].id) && loops < room.players.length) {
                    room.turnIndex = (room.turnIndex + 1) % room.players.length;
                    loops++;
                }
                startTurnTimer(room, io); // Restart timer for next round/turn
            } else {
                // Game Over or other state - clear timer
                if (room.timerId) clearTimeout(room.timerId);
                room.timerId = null;
                room.turnExpiresAt = null;
            }

            io.to(data.code).emit('room_update', room);
        } else {
            io.to(data.code).emit('room_update', room);
        }
    });

    socket.on('restart_game', (data) => {
        const room = rooms[data.code];
        if (!room) return;
        if (room.timerId) clearTimeout(room.timerId);
        room.state = 'lobby';
        room.inputs = [];
        room.votes = {};
        room.kickedIds = [];
        room.winner = null;
        room.impostorIds = [];
        room.inputsInCurrentRound = 0;
        room.timerId = null;
        room.turnExpiresAt = null;
        io.to(data.code).emit('room_update', room);
    });

    socket.on('leave_room', (data) => {
        const room = rooms[data.code];
        if (!room) return;

        if (data.isHost) {
            // Host is leaving - close the room for everyone
            if (room.timerId) clearTimeout(room.timerId);
            io.to(data.code).emit('room_closed');
            delete rooms[data.code];
        } else {
            // Regular player leaving - just remove them
            const playerIndex = room.players.findIndex(p => p.id === socket.id);
            if (playerIndex !== -1) {
                room.players.splice(playerIndex, 1);

                // If no players left, delete room
                if (room.players.length === 0) {
                    if (room.timerId) clearTimeout(room.timerId);
                    delete rooms[data.code];
                } else {
                    // Assign new host if needed
                    const hasHost = room.players.some(p => p.isHost);
                    if (!hasHost && room.players.length > 0) {
                        room.players[0].isHost = true;
                    }
                    io.to(data.code).emit('room_update', room);
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
                    if (room.timerId) clearTimeout(room.timerId);
                    io.to(code).emit('room_closed');
                    delete rooms[code];
                    return;
                }

                // If game is in progress and less than 3 active players, pause
                if ((room.state === 'playing' || room.state === 'voting') && activePlayers.length < 3) {
                    room.paused = true;
                    room.pauseReason = 'Esperando reconexión de jugadores... (mínimo 3 jugadores)';
                    if (room.timerId) clearTimeout(room.timerId); // Pause timer
                }

                // Notify host if players disconnected
                const host = room.players.find(p => p.isHost);
                if (host && activePlayers.length < room.players.filter(p => !room.kickedIds.includes(p.id)).length) {
                    io.to(host.id).emit('player_disconnected', {
                        playerName: player.name,
                        activePlayers: activePlayers.length
                    });
                }

                io.to(code).emit('room_update', room);

                // Clean up completely disconnected rooms after 5 minutes
                setTimeout(() => {
                    const currentRoom = rooms[code];
                    if (currentRoom) {
                        const allDisconnected = currentRoom.players.every(p => p.disconnected);
                        if (allDisconnected) {
                            if (currentRoom.timerId) clearTimeout(currentRoom.timerId);
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
