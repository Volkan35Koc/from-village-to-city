import React, { useContext, useState } from 'react';
import { GameContext } from '../context/GameContext';
import HexGrid from './Board/HexGrid';
import TradeModal from './TradeModal';
import DevCardDisplay from './DevCardDisplay';
import Chat from './Chat';
import BuildingCosts from './BuildingCosts';

const Game = () => {
    const { gameState, playerId, performAction } = useContext(GameContext);
    const [showTradeModal, setShowTradeModal] = useState(false);

    if (!gameState) return <div>Loading Game State...</div>;

    const myPlayer = gameState.players.find(p => p.id === playerId);

    if (gameState.gameState.phase === 'GAME_OVER') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
                <h1 style={{ fontSize: '48px', color: '#333' }}>Game Over!</h1>
                <h2 style={{ fontSize: '32px', color: '#2ecc71' }}>Winner: {gameState.gameState.winner}</h2>
                <button
                    style={{ padding: '10px 20px', fontSize: '18px', marginTop: '20px', cursor: 'pointer' }}
                    onClick={() => window.location.reload()}
                >
                    Back to Lobby
                </button>
            </div>
        );
    }

    const handleIntersectionClick = (intersectionId) => {
        if (gameState.gameState.currentPlayer !== playerId) return;
        performAction('BUILD_SETTLEMENT', { intersectionId });
    };

    const handleEdgeClick = (edgeId) => {
        if (gameState.gameState.currentPlayer !== playerId) return;
        performAction('BUILD_ROAD', { edgeId });
    };

    const handleHexClick = (tileId) => {
        if (gameState.gameState.phase === 'ROBBER_PLACEMENT') {
            if (gameState.gameState.currentPlayer !== playerId) return;
            performAction('MOVE_ROBBER', { tileId });
        }
    };

    const handleTradeOffer = (offer) => {
        performAction('OFFER_TRADE', offer);
    };

    const handleAcceptTrade = () => {
        if (gameState.gameState.tradeOffer) {
            performAction('ACCEPT_TRADE', { tradeId: gameState.gameState.tradeOffer.id });
        }
    };

    const handleRejectTrade = () => {
        if (gameState.gameState.tradeOffer) {
            performAction('REJECT_TRADE', { tradeId: gameState.gameState.tradeOffer.id });
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
                <div>
                    <h2>Room: {gameState.roomId}</h2>
                    <p>Phase: {gameState.gameState.phase}</p>
                    {gameState.gameState.phase === 'ROBBER_PLACEMENT' && (
                        <p style={{ fontWeight: 'bold', color: 'red' }}>
                            {gameState.gameState.currentPlayer === playerId ? "Click a tile to move the Robber!" : "Waiting for current player to move Robber..."}
                        </p>
                    )}
                    {(gameState.gameState.phase === 'SETUP_ROUND_1' || gameState.gameState.phase === 'SETUP_ROUND_2') && (
                        <p style={{ fontWeight: 'bold', color: 'blue' }}>
                            {gameState.gameState.currentPlayer === playerId ?
                                `Place a ${gameState.gameState.setupSubPhase === 'SETTLEMENT' ? 'Settlement' : 'Road'}!`
                                : `Waiting for ${gameState.players.find(p => p.id === gameState.gameState.currentPlayer)?.name} to place a ${gameState.gameState.setupSubPhase === 'SETTLEMENT' ? 'Settlement' : 'Road'}...`}
                        </p>
                    )}
                    <button onClick={() => performAction('END_TURN')} disabled={gameState.gameState.currentPlayer !== playerId || gameState.gameState.phase === 'ROBBER_PLACEMENT' || gameState.gameState.phase.startsWith('SETUP')}>End Turn</button>
                </div>
                <div>
                    <h3>Players:</h3>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {gameState.players.map(p => (
                            <li key={p.id} style={{
                                fontWeight: p.id === playerId ? 'bold' : 'normal',
                                color: ['red', 'blue', 'orange', 'black'][p.colorIndex],
                                padding: '2px 0'
                            }}>
                                {p.name} {p.id === gameState.gameState.currentPlayer ? '<< Turn' : ''}
                                <br />
                                <span style={{ fontSize: '0.9em', color: '#666' }}>
                                    VP: {p.victoryPoints} | Cards: {Object.values(p.resources).reduce((a, b) => a + b, 0)}
                                </span>
                            </li>
                        ))}
                    </ul>

                    <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                        <h4>Bonuses:</h4>
                        <div style={{ fontSize: '0.9em' }}>
                            <p>
                                <strong>Largest Army: </strong>
                                {gameState.gameState.largestArmy.holder ?
                                    `${gameState.players.find(p => p.id === gameState.gameState.largestArmy.holder)?.name} (${gameState.gameState.largestArmy.size})`
                                    : 'None'}
                            </p>
                            <p>
                                <strong>Longest Road: </strong>
                                {gameState.gameState.longestRoad.holder ?
                                    `${gameState.players.find(p => p.id === gameState.gameState.longestRoad.holder)?.name} (${gameState.gameState.longestRoad.size})`
                                    : 'None'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Trade Notification */}
            {gameState.gameState.tradeOffer && gameState.gameState.tradeOffer.status === 'PENDING' && (
                <div style={{ background: '#fff3cd', border: '1px solid #ffeeba', padding: '10px', margin: '10px 0', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <strong>Trade Offer</strong> from {gameState.players.find(p => p.id === gameState.gameState.tradeOffer.from)?.name}:
                        <div style={{ display: 'flex', gap: '20px', marginTop: '5px' }}>
                            <span>Gives: {Object.entries(gameState.gameState.tradeOffer.give).map(([k, v]) => `${k}:${v}`).join(', ')}</span>
                            <span>Asks: {Object.entries(gameState.gameState.tradeOffer.get).map(([k, v]) => `${k}:${v}`).join(', ')}</span>
                        </div>
                    </div>
                    {gameState.gameState.tradeOffer.from !== playerId && (
                        <div>
                            <button onClick={handleAcceptTrade} style={{ marginRight: '10px', background: 'green', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>Accept</button>
                            <button onClick={handleRejectTrade} style={{ background: 'red', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>Reject</button>
                        </div>
                    )}
                    {gameState.gameState.tradeOffer.from === playerId && (
                        <div>
                            <button onClick={handleRejectTrade} style={{ background: '#666', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>Cancel</button>
                        </div>
                    )}
                </div>
            )}

            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f0f0f0', margin: '20px 0', overflow: 'hidden', borderRadius: '8px' }}>
                <HexGrid
                    board={gameState.board}
                    players={gameState.players}
                    onIntersectionClick={handleIntersectionClick}
                    onEdgeClick={handleEdgeClick}
                    onHexClick={handleHexClick}
                />
            </div>

            <div style={{ borderTop: '1px solid #ccc', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {myPlayer && (
                    <div style={{ flex: 1 }}>
                        <h3>My Resources:</h3>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {Object.entries(myPlayer.resources).map(([res, amount]) => (
                                <div key={res} style={{
                                    border: '1px solid #333',
                                    padding: '5px 10px',
                                    borderRadius: '4px',
                                    background: amount > 0 ? '#eef' : '#eee',
                                    fontWeight: amount > 0 ? 'bold' : 'normal'
                                }}>
                                    {res}: {amount}
                                </div>
                            ))}
                        </div>
                        {/* Dev Cards Section */}
                        <DevCardDisplay
                            cards={myPlayer.devCards}
                            canPlay={gameState.gameState.currentPlayer === myPlayer.id && (gameState.gameState.phase === 'PLAYING' || gameState.gameState.phase === 'ROBBER_PLACEMENT')}
                            onPlayCard={(index, payload) => performAction('PLAY_DEV_CARD', { cardIndex: index, target: payload })}
                        />
                    </div>
                )}

                <div style={{ textAlign: 'center', minWidth: '150px' }}>
                    <h3>Dice: <span style={{ fontSize: '1.2em' }}>{gameState.gameState.dice[0] + gameState.gameState.dice[1]}</span></h3>
                </div>

                <div style={{ marginTop: '10px', flex: 1, display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    {myPlayer && gameState.gameState.currentPlayer === myPlayer.id && (
                        <>
                            <button
                                onClick={() => performAction('BUY_DEV_CARD')}
                                disabled={gameState.gameState.phase !== 'PLAYING'}
                                style={{ padding: '10px 20px', cursor: 'pointer', background: '#9b59b6', color: 'white', border: 'none', borderRadius: '4px' }}
                            >
                                Buy Dev Card
                            </button>
                            <button
                                onClick={() => setShowTradeModal(true)}
                                disabled={gameState.gameState.phase !== 'PLAYING'}
                                style={{ padding: '10px 20px', cursor: 'pointer', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px' }}
                            >
                                Trade
                            </button>
                            <button
                                onClick={() => performAction('ROLL_DICE')}
                                disabled={gameState.gameState.phase !== 'PLAYING'}
                                style={{ padding: '10px 20px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                Roll Dice
                            </button>
                        </>
                    )}
                    {gameState.players.length >= 2 && gameState.gameState.phase === 'WAITING' && (
                        <button onClick={() => performAction('START_GAME')} style={{ padding: '10px 20px', cursor: 'pointer', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px' }}>Start Game</button>
                    )}
                </div>
            </div>

            {showTradeModal && myPlayer && (
                <TradeModal
                    onClose={() => setShowTradeModal(false)}
                    onOfferTrade={handleTradeOffer}
                    playerResources={myPlayer.resources}
                />
            )}

            <div style={{ position: 'fixed', bottom: '20px', left: '20px', height: '300px', width: '300px', zIndex: 100 }}>
                {myPlayer && (
                    <Chat
                        messages={gameState.gameState.chatMessages || []}
                        onSendMessage={(text) => performAction('SEND_MESSAGE', { message: text })}
                        myPlayerName={myPlayer.name}
                    />
                )}
            </div>

            <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 90 }}>
                <BuildingCosts />
            </div>
        </div>
    );
};

export default Game;
