const Board = require('./Board');
const Player = require('./Player');

const COSTS = {
    ROAD: { brick: 1, wood: 1 },
    SETTLEMENT: { brick: 1, wood: 1, wheat: 1, sheep: 1 },
    CITY: { wheat: 2, ore: 3 },
    DEV_CARD: { wheat: 1, sheep: 1, ore: 1 }
};

const DEV_CARD_TYPES = [
    ...Array(14).fill('KNIGHT'),
    ...Array(5).fill('VP'),
    ...Array(2).fill('ROAD_BUILDING'),
    ...Array(2).fill('YEAR_OF_PLENTY'),
    ...Array(2).fill('MONOPOLY')
];

class Game {
    constructor(roomId, io) {
        this.roomId = roomId;
        this.io = io;
        this.players = [];
        this.board = new Board();
        this.devCardDeck = this.shuffleDeck([...DEV_CARD_TYPES]);
        this.gameState = {
            turnIndex: 0,
            phase: 'WAITING', // WAITING, SETUP_ROUND_1, SETUP_ROUND_2, PLAYING, ROBBER_PLACEMENT, GAME_OVER
            currentPlayer: null,
            dice: [0, 0],
            setupTurnIndex: 0, // for snake draft
            tradeOffer: null, // { from, to, give, get, status }
            winner: null,
            largestArmy: { holder: null, size: 2 },
            longestRoad: { holder: null, size: 4 },
            chatMessages: [] // { sender: string, text: string, timestamp: number }
        };
    }

    shuffleDeck(deck) {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    }

    addPlayer(socket, name) {
        if (this.players.length >= 4 || this.gameState.phase !== 'WAITING') return false;
        if (this.players.some(p => p.id === socket.id)) return true;

        const player = new Player(socket.id, name, this.players.length);
        this.players.push(player);
        return true;
    }

    startGame() {
        if (this.players.length < 2) return false;

        // Shuffle
        for (let i = this.players.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.players[i], this.players[j]] = [this.players[j], this.players[i]];
        }
        this.players.forEach((p, index) => {
            p.colorIndex = index;
            // Removed debug resources
            p.resources = { wood: 0, brick: 0, sheep: 0, wheat: 0, ore: 0 };
        });

        this.gameState.phase = 'SETUP_ROUND_1';
        this.gameState.setupSubPhase = 'SETTLEMENT'; // SETTLEMENT or ROAD
        this.gameState.turnIndex = 0;
        this.gameState.currentPlayer = this.players[0].id;

        this.io.to(this.roomId).emit('gameStarted', this.getState());
        return true;
    }

    handleAction(socket, action, payload) {
        const player = this.players.find(p => p.id === socket.id);
        if (!player) return;

        console.log(`Action: ${action} from ${player.name}`, payload);

        switch (action) {
            case 'START_GAME':
                this.startGame();
                break;
            case 'ROLL_DICE':
                this.rollDice(player);
                break;
            case 'MOVE_ROBBER':
                this.moveRobber(player, payload.tileId);
                break;
            case 'OFFER_TRADE':
                this.offerTrade(player, payload);
                break;
            case 'ACCEPT_TRADE':
                this.acceptTrade(player, payload);
                break;
            case 'REJECT_TRADE':
                this.rejectTrade(player, payload);
                break;
            case 'BUY_DEV_CARD':
                this.buyDevCard(player);
                break;
            case 'PLAY_DEV_CARD':
                this.playDevCard(player, payload.cardIndex, payload.target);
                break;
            case 'BUILD_SETTLEMENT':
                this.buildSettlement(player, payload.intersectionId);
                break;
            case 'BUILD_ROAD':
                this.buildRoad(player, payload.edgeId);
                break;
            case 'END_TURN':
                this.endTurn(player);
                break;
            case 'SEND_MESSAGE':
                this.sendMessage(player, payload.message);
                break;
            default:
                console.log('Unknown action:', action);
        }
    }

    offerTrade(player, offer) {
        if (this.gameState.currentPlayer !== player.id) return;

        // Check affordability
        for (const [res, amount] of Object.entries(offer.give)) {
            if ((player.resources[res] || 0) < amount) return;
        }

        // Bank Trade
        if (offer.to === 'BANK') {
            const giveRes = Object.keys(offer.give)[0];
            const getRes = Object.keys(offer.get)[0];
            const giveAmount = offer.give[giveRes];
            const getAmount = offer.get[getRes];

            if (giveAmount >= 4 * getAmount) {
                player.resources[giveRes] -= giveAmount;
                player.addResources(getRes, getAmount);
                this.io.to(this.roomId).emit('gameUpdate', this.getState());
            }
            return;
        }

        // Player Trade
        this.gameState.tradeOffer = {
            id: Date.now(),
            from: player.id,
            give: offer.give,
            get: offer.get,
            status: 'PENDING'
        };
        this.io.to(this.roomId).emit('gameUpdate', this.getState());
    }

    acceptTrade(player, tradeId) {
        const offer = this.gameState.tradeOffer;
        if (!offer || offer.status !== 'PENDING') return;
        if (offer.from === player.id) return;

        // Check if acceptor has resources
        for (const [res, amount] of Object.entries(offer.get)) {
            if ((player.resources[res] || 0) < amount) return;
        }

        // Execute Trade
        const initiator = this.players.find(p => p.id === offer.from);
        if (!initiator) return;

        // Double check initiator still has resources
        for (const [res, amount] of Object.entries(offer.give)) {
            if ((initiator.resources[res] || 0) < amount) {
                this.gameState.tradeOffer = null;
                this.io.to(this.roomId).emit('gameUpdate', this.getState());
                return;
            }
        }

        // Exchange
        for (const [res, amount] of Object.entries(offer.give)) {
            initiator.resources[res] -= amount;
            player.addResources(res, amount);
        }
        for (const [res, amount] of Object.entries(offer.get)) {
            player.resources[res] -= amount;
            initiator.addResources(res, amount);
        }

        this.gameState.tradeOffer = null;
        this.io.to(this.roomId).emit('gameUpdate', this.getState());
    }

    rejectTrade(player, tradeId) {
        if (this.gameState.tradeOffer && this.gameState.tradeOffer.from === player.id) {
            this.gameState.tradeOffer = null;
            this.io.to(this.roomId).emit('gameUpdate', this.getState());
        }
    }

    rollDice(player) {
        if (this.gameState.currentPlayer !== player.id) return;

        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        const total = d1 + d2;

        this.gameState.dice = [d1, d2];

        if (total === 7) {
            this.gameState.phase = 'ROBBER_PLACEMENT';
        } else {
            this.distributeResources(total);
        }

        this.io.to(this.roomId).emit('gameUpdate', this.getState());
    }

    moveRobber(player, tileId) {
        if (this.gameState.currentPlayer !== player.id) return;
        if (this.gameState.phase !== 'ROBBER_PLACEMENT') return;
        if (this.board.robberPosition === tileId) return;

        this.board.robberPosition = tileId;

        // Steal from random player on this tile
        const playersOnTile = [];
        const tile = this.board.tiles.find(t => t.id === tileId);
        if (tile) {
            const intersections = this.board.getIntersectionsForTile(tile);
            intersections.forEach(i => {
                if (i.owner && i.owner !== player.id) {
                    if (!playersOnTile.includes(i.owner)) {
                        playersOnTile.push(i.owner);
                    }
                }
            });
        }

        if (playersOnTile.length > 0) {
            const victimId = playersOnTile[Math.floor(Math.random() * playersOnTile.length)];
            const victim = this.players.find(p => p.id === victimId);

            // Steal 1 random resource
            const victimResources = Object.keys(victim.resources).filter(r => victim.resources[r] > 0);
            if (victimResources.length > 0) {
                const resourceToSteal = victimResources[Math.floor(Math.random() * victimResources.length)];
                victim.resources[resourceToSteal]--;
                player.addResources(resourceToSteal, 1);
            }
        }

        this.gameState.phase = 'PLAYING';
        this.io.to(this.roomId).emit('gameUpdate', this.getState());
    }

    distributeResources(number) {
        const producingTiles = this.board.tiles.filter(t => t.number === number && t.resource !== 'DESERT' && t.id !== this.board.robberPosition);
        producingTiles.forEach(tile => {
            const intersections = this.board.getIntersectionsForTile(tile);
            intersections.forEach(intersection => {
                if (intersection.owner) {
                    const player = this.players.find(p => p.id === intersection.owner);
                    if (player) {
                        const amount = intersection.type === 'CITY' ? 2 : 1;
                        player.addResources(tile.resource, amount);
                    }
                }
            });
        });
    }

    buildSettlement(player, intersectionId) {
        if (this.gameState.currentPlayer !== player.id) return;

        // Valid Phases
        const isSetup = this.gameState.phase === 'SETUP_ROUND_1' || this.gameState.phase === 'SETUP_ROUND_2';
        if (!isSetup && this.gameState.phase !== 'PLAYING') return;

        // Setup Subqueue check
        if (isSetup && this.gameState.setupSubPhase !== 'SETTLEMENT') return;

        // Cost Check
        if (this.gameState.phase === 'PLAYING') {
            if (!player.canAfford(COSTS.SETTLEMENT)) return;
        }

        // Placement Logic (Pass true/false for isSetup to Board if we implemented strictness, or relying on basic checks)
        // For setup, we might need to relax "connected to road" rule, but enforce distancerule.
        // Board.js `placeSettlement` validation needs to know if it's setup (to ignore road connection).
        // For MVP, we'll assume Board checks distance. We need to handle ignoring road connection here or update Board.
        // Let's assume Board allows isolated settlement if it's setup or we update Board.
        // Actually Board.js had a TODO. Let's rely on it returning true if distance is OK. 
        // We might need to modify Board.js to allow unconnected settlements.
        // Wait, Board.js placeSettlement currently only checks distance and returns true. Connectivity was TODO.
        // So we are good for Setup.

        if (this.board.placeSettlement(player.id, intersectionId)) {
            if (this.gameState.phase === 'PLAYING') {
                player.pay(COSTS.SETTLEMENT);
            }
            player.settlements++;
            player.victoryPoints++;

            // Setup Logic
            if (isSetup) {
                this.gameState.setupSubPhase = 'ROAD';
                this.gameState.latestSettlementId = intersectionId; // For road connection check?

                // Round 2 Resource Distribution
                if (this.gameState.phase === 'SETUP_ROUND_2') {
                    // Give 1 resource for each adjacent hex
                    const intersection = this.board.intersections[intersectionId];
                    // Need a way to get hexes from intersection. Board doesn't have it directly optimized.
                    // We can iterate tiles and check corners.
                    this.board.tiles.forEach(tile => {
                        const corners = this.board.getIntersectionsForTile(tile);
                        if (corners.some(c => c.id === intersectionId) && tile.resource !== 'DESERT') {
                            player.addResources(tile.resource, 1);
                        }
                    });
                }
            } else {
                this.checkWinCondition(player);
            }

            this.io.to(this.roomId).emit('gameUpdate', this.getState());
        }
    }

    buildRoad(player, edgeId) {
        if (this.gameState.currentPlayer !== player.id) return;

        // Valid Phases
        const isSetup = this.gameState.phase === 'SETUP_ROUND_1' || this.gameState.phase === 'SETUP_ROUND_2';
        if (!isSetup && this.gameState.phase !== 'PLAYING') return;

        // Setup Subqueue check
        if (isSetup && this.gameState.setupSubPhase !== 'ROAD') return;

        if (this.gameState.phase === 'PLAYING') {
            if (!player.canAfford(COSTS.ROAD)) return;
        }

        if (this.board.placeRoad(player.id, edgeId)) {
            if (this.gameState.phase === 'PLAYING') {
                player.pay(COSTS.ROAD);
                player.roads++;
                this.checkLongestRoad(player);
            } else {
                // Setup Phase: Build free and Advance Setup
                player.roads++;
                this.advanceSetupTurn();
            }

            this.io.to(this.roomId).emit('gameUpdate', this.getState());
        }
    }

    advanceSetupTurn() {
        if (this.gameState.phase === 'SETUP_ROUND_1') {
            this.gameState.turnIndex++;
            if (this.gameState.turnIndex >= this.players.length) {
                this.gameState.phase = 'SETUP_ROUND_2';
                this.gameState.turnIndex = this.players.length - 1; // Last player goes again
            }
        } else if (this.gameState.phase === 'SETUP_ROUND_2') {
            this.gameState.turnIndex--;
            if (this.gameState.turnIndex < 0) {
                this.gameState.phase = 'PLAYING';
                this.gameState.turnIndex = 0; // Player 1 starts
            }
        }

        if (this.gameState.phase !== 'PLAYING') {
            this.gameState.setupSubPhase = 'SETTLEMENT';
            this.gameState.currentPlayer = this.players[this.gameState.turnIndex].id;
        } else {
            this.gameState.currentPlayer = this.players[0].id;
            this.gameState.setupSubPhase = null;
        }
    }

    buyDevCard(player) {
        if (this.gameState.currentPlayer !== player.id) return;
        if (this.gameState.phase !== 'PLAYING') return;
        if (this.devCardDeck.length === 0) return;

        if (player.pay(COSTS.DEV_CARD)) {
            const cardType = this.devCardDeck.pop();
            player.devCards.push({ type: cardType, used: false, isNew: true });
            this.io.to(this.roomId).emit('gameUpdate', this.getState());
        }
    }

    playDevCard(player, cardIndex, target) {
        if (this.gameState.currentPlayer !== player.id) return;
        if (this.gameState.phase !== 'PLAYING' && this.gameState.phase !== 'ROBBER_PLACEMENT') return;

        const card = player.devCards[cardIndex];
        // Cannot play new cards (except VP usually revealed at end, but here we simplify)
        if (!card || card.used || (card.isNew && card.type !== 'VP')) return;

        card.used = true;
        player.playedDevCards.push(card);
        player.devCards.splice(cardIndex, 1);

        switch (card.type) {
            case 'KNIGHT':
                this.gameState.phase = 'ROBBER_PLACEMENT';
                player.knightsPlayed++;
                this.checkLargestArmy(player);
                break;
            case 'VP':
                player.victoryPoints++;
                this.checkWinCondition(player);
                break;
            case 'ROAD_BUILDING':
                player.addResources('wood', 2);
                player.addResources('brick', 2);
                break;
            case 'YEAR_OF_PLENTY':
                if (target && target.resources && Array.isArray(target.resources) && target.resources.length === 2) {
                    target.resources.forEach(r => player.addResources(r, 1));
                } else {
                    // Fallback to random if no target provided (e.g. old client)
                    const resTypes = ['wood', 'brick', 'sheep', 'wheat', 'ore'];
                    player.addResources(resTypes[Math.floor(Math.random() * 5)], 1);
                    player.addResources(resTypes[Math.floor(Math.random() * 5)], 1);
                }
                break;
            case 'MONOPOLY':
                if (target && target.resource) {
                    this.players.forEach(p => {
                        if (p.id !== player.id) {
                            const count = p.resources[target.resource];
                            p.resources[target.resource] = 0;
                            player.addResources(target.resource, count);
                        }
                    });
                }
                break;
        }

        this.io.to(this.roomId).emit('gameUpdate', this.getState());
    }

    checkWinCondition(player) {
        if (player.victoryPoints >= 10) {
            this.gameState.phase = 'GAME_OVER';
            this.gameState.winner = player.name;
        }
    }

    checkLargestArmy(player) {
        if (player.knightsPlayed > this.gameState.largestArmy.size) {
            const previousHolderId = this.gameState.largestArmy.holder;

            if (previousHolderId === player.id) {
                // Already holds it, just update size
                this.gameState.largestArmy.size = player.knightsPlayed;
                return;
            }

            // Take from previous
            if (previousHolderId) {
                const prevPlayer = this.players.find(p => p.id === previousHolderId);
                if (prevPlayer) prevPlayer.victoryPoints -= 2;
            }

            this.gameState.largestArmy = { holder: player.id, size: player.knightsPlayed };
            player.victoryPoints += 2;

            this.checkWinCondition(player);
            // We don't emit here because caller usually emits
        }
    }

    checkLongestRoad(player) {
        const length = this.board.getLongestRoad(player.id);

        // Optimize: only check if length > current max (4 initially)
        if (length > this.gameState.longestRoad.size) {
            const previousHolderId = this.gameState.longestRoad.holder;

            if (previousHolderId === player.id) {
                this.gameState.longestRoad.size = length;
                return;
            }

            if (previousHolderId) {
                const prevPlayer = this.players.find(p => p.id === previousHolderId);
                if (prevPlayer) prevPlayer.victoryPoints -= 2;
            }

            this.gameState.longestRoad = { holder: player.id, size: length };
            player.victoryPoints += 2;

            this.checkWinCondition(player);
        }
    }

    endTurn(player) {
        if (this.gameState.currentPlayer !== player.id) return;
        if (this.gameState.phase !== 'PLAYING') return; // Cannot end if waiting for robber

        // Reset isNew for dev cards
        player.devCards.forEach(c => c.isNew = false);

        this.gameState.turnIndex = (this.gameState.turnIndex + 1) % this.players.length;
        this.gameState.currentPlayer = this.players[this.gameState.turnIndex].id;

        this.io.to(this.roomId).emit('gameUpdate', this.getState());
    }

    sendMessage(player, text) {
        // Basic validation
        if (!text || text.trim().length === 0) return;

        const message = {
            sender: player.name,
            colorIndex: player.colorIndex,
            text: text.trim().substring(0, 200), // Limit length
            timestamp: Date.now()
        };

        this.gameState.chatMessages.push(message);

        // Keep history limited
        if (this.gameState.chatMessages.length > 50) {
            this.gameState.chatMessages.shift();
        }

        this.io.to(this.roomId).emit('gameUpdate', this.getState());
    }

    getState() {
        return {
            roomId: this.roomId,
            players: this.players,
            board: this.board.getState(),
            gameState: this.gameState
        };
    }
}

module.exports = Game;
