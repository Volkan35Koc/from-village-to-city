const Game = require('./Game');

class GameManager {
    constructor(io) {
        this.io = io;
        this.games = new Map(); // roomId -> Game instance
    }

    handleConnection(socket) {
        socket.on('createGame', (roomName, playerName) => {
            const roomId = this.generateRoomId();
            const game = new Game(roomId, this.io);
            this.games.set(roomId, game);

            this.joinGame(socket, roomId, playerName);
        });

        socket.on('createGameWithBots', (playerName, botCount) => {
            const roomId = 'BOT-' + this.generateRoomId(); // Special prefix
            const game = new Game(roomId, this.io);
            game.isBotGame = true;
            this.games.set(roomId, game);

            this.joinGame(socket, roomId, playerName);

            // Add Bots
            for (let i = 0; i < botCount; i++) {
                game.addBot(`Bot ${i + 1}`);
            }
        });

        socket.on('joinGame', (roomId, playerName) => {
            if (this.games.has(roomId)) {
                this.joinGame(socket, roomId, playerName);
            } else {
                socket.emit('error', 'Room not found');
            }
        });

        // Delegate game actions to specific game instance
        socket.on('gameAction', (data) => {
            if (!data) return;
            const { roomId, action, payload } = data;
            const game = this.games.get(roomId);
            if (game) {
                game.handleAction(socket, action, payload);
            }
        });

        socket.on('disconnect', () => {
            this.handleDisconnect(socket);
        });
    }

    handleDisconnect(socket) {
        // Find game player is in
        for (const [roomId, game] of this.games.entries()) {
            const playerIndex = game.players.findIndex(p => p.id === socket.id);
            if (playerIndex !== -1) {
                const player = game.players[playerIndex];
                console.log(`Player ${player.name} disconnected from room ${roomId}`);

                // For MVP, if game hasn't started, remove player.
                // If game started, maybe mark as disconnected?
                if (game.gameState.phase === 'WAITING') {
                    game.players.splice(playerIndex, 1);
                    this.io.to(roomId).emit('gameUpdate', game.getState());
                } else {
                    // Notify others
                    this.io.to(roomId).emit('notification', `${player.name} disconnected!`);
                }
                break;
            }
        }
    }

    joinGame(socket, roomId, playerName) {
        const game = this.games.get(roomId);
        if (game.addPlayer(socket, playerName)) {
            socket.join(roomId);
            socket.emit('gameJoined', { roomId, gameState: game.getState() });
            this.io.to(roomId).emit('playerJoined', { playerName });
        } else {
            socket.emit('error', 'Game full or started');
        }
    }

    generateRoomId() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }
}

module.exports = GameManager;
