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
        <div style={{ display: 'flex', flexDirection: 'row', height: '100vh', width: '100vw', fontFamily: 'sans-serif', overflow: 'hidden' }}>

            {/* LEFT PANEL: Game Board */}
            <div style={{
                flex: 7,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: '#e0e0e0',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <HexGrid
                    board={gameState.board}
                    players={gameState.players}
                    onIntersectionClick={handleIntersectionClick}
                    onEdgeClick={handleEdgeClick}
                    onHexClick={handleHexClick}
                />

                {/* Phase Overlay on Board */}
                <div style={{ position: 'absolute', top: '20px', left: '20px', background: 'rgba(255,255,255,0.8)', padding: '10px', borderRadius: '8px', pointerEvents: 'none' }}>
                    <h2 style={{ margin: 0 }}>Room: {gameState.roomId}</h2>
                    <p style={{ margin: 0 }}>Phase: {gameState.gameState.phase}</p>
                    {gameState.gameState.phase === 'ROBBER_PLACEMENT' && (
                        <p style={{ fontWeight: 'bold', color: 'red', margin: '5px 0 0 0' }}>
                            {gameState.gameState.currentPlayer === playerId ? "Move Robber!" : "Waiting for Robber..."}
                        </p>
                    )}
                </div>
            </div>

            {/* RIGHT PANEL: Info & Controls */}
            <div style={{
                flex: 3,
                display: 'flex',
                flexDirection: 'column',
                padding: '20px',
                background: '#fff',
                borderLeft: '2px solid #ccc',
                overflowY: 'auto',
                boxShadow: '-2px 0 5px rgba(0,0,0,0.1)'
            }}>
                {/* Turn Status */}
                <div style={{ marginBottom: '20px', textAlign: 'center', padding: '10px', background: gameState.gameState.currentPlayer === playerId ? '#d4edda' : '#f8d7da', borderRadius: '5px' }}>
                    <h3 style={{ margin: 0 }}>
                        {gameState.gameState.currentPlayer === playerId ? "YOUR TURN" : `Waiting for ${gameState.players.find(p => p.id === gameState.gameState.currentPlayer)?.name}`}
                    </h3>
                    {(gameState.gameState.phase === 'SETUP_ROUND_1' || gameState.gameState.phase === 'SETUP_ROUND_2') && (
                        <p style={{ margin: '5px 0 0 0', fontWeight: 'bold' }}>
                            {gameState.gameState.setupSubPhase === 'SETTLEMENT' ? 'Place Settlement' : 'Place Road'}
                        </p>
                    )}
                </div>

                {/* Dice & Resources */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ textAlign: 'center' }}>
                        <strong>Dice</strong>
                        <div style={{ fontSize: '2em', fontWeight: 'bold' }}>{gameState.gameState.dice[0] + gameState.gameState.dice[1]}</div>
                    </div>
                </div>

                {/* My Resources */}
                {myPlayer && (
                    <div style={{ marginBottom: '20px', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                        <h4 style={{ marginTop: 0 }}>My Resources:</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {Object.entries(myPlayer.resources).map(([res, amount]) => (
                                <div key={res} style={{
                                    border: '1px solid #ccc',
                                    padding: '5px 8px',
                                    borderRadius: '4px',
                                    background: amount > 0 ? '#fff' : '#eee',
                                    fontWeight: amount > 0 ? 'bold' : 'normal',
                                    fontSize: '0.9em'
                                }}>
                                    {res}: {amount}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                    {myPlayer && gameState.gameState.currentPlayer === myPlayer.id && (
                        <>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={() => performAction('ROLL_DICE')}
                                    disabled={gameState.gameState.phase !== 'PLAYING'}
                                    style={{ flex: 1, padding: '10px', cursor: 'pointer', fontWeight: 'bold', background: '#e67e22', color: 'white', border: 'none', borderRadius: '4px' }}
                                >
                                    Roll Dice
                                </button>
                                <button onClick={() => performAction('END_TURN')} disabled={gameState.gameState.phase !== 'PLAYING'} style={{ flex: 1, padding: '10px', cursor: 'pointer', background: '#c0392b', color: 'white', border: 'none', borderRadius: '4px' }}>
                                    End Turn
                                </button>
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={() => setShowTradeModal(true)}
                                    disabled={gameState.gameState.phase !== 'PLAYING'}
                                    style={{ flex: 1, padding: '10px', cursor: 'pointer', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px' }}
                                >
                                    Trade
                                </button>
                                <button
                                    onClick={() => performAction('BUY_DEV_CARD')}
                                    disabled={gameState.gameState.phase !== 'PLAYING'}
                                    style={{ flex: 1, padding: '10px', cursor: 'pointer', background: '#9b59b6', color: 'white', border: 'none', borderRadius: '4px' }}
                                >
                                    Buy Dev Card
                                </button>
                            </div>
                        </>
                    )}
                    {gameState.players.length >= 2 && gameState.gameState.phase === 'WAITING' && (
                        <button onClick={() => performAction('START_GAME')} style={{ padding: '15px', cursor: 'pointer', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1.2em' }}>Start Game</button>
                    )}
                </div>

                {/* Player List */}
                <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ marginBottom: '10px' }}>Players:</h4>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {gameState.players.map(p => (
                            <li key={p.id} style={{
                                padding: '5px',
                                borderBottom: '1px solid #eee',
                                color: ['red', 'blue', 'orange', 'black'][p.colorIndex],
                                fontWeight: p.id === playerId ? 'bold' : 'normal'
                            }}>
                                {p.name} - VP: {p.victoryPoints} - Cards: {Object.values(p.resources).reduce((a, b) => a + b, 0)}
                                {p.id === gameState.gameState.currentPlayer && ' ◀'}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Bonuses */}
                <div style={{ fontSize: '0.9em', color: '#555', marginBottom: '20px' }}>
                    <div>Longest Road: {gameState.gameState.longestRoad.holder ? gameState.players.find(p => p.id === gameState.gameState.longestRoad.holder)?.name : 'None'} ({gameState.gameState.longestRoad.size})</div>
                    <div>Largest Army: {gameState.gameState.largestArmy.holder ? gameState.players.find(p => p.id === gameState.gameState.largestArmy.holder)?.name : 'None'} ({gameState.gameState.largestArmy.size})</div>
                </div>

                {/* Dev Cards */}
                {myPlayer && (
                    <div style={{ marginBottom: '20px' }}>
                        <DevCardDisplay
                            cards={myPlayer.devCards}
                            canPlay={gameState.gameState.currentPlayer === myPlayer.id && (gameState.gameState.phase === 'PLAYING' || gameState.gameState.phase === 'ROBBER_PLACEMENT')}
                            onPlayCard={(index, payload) => performAction('PLAY_DEV_CARD', { cardIndex: index, target: payload })}
                        />
                    </div>
                )}

                {/* Building Costs Reference */}
                <div style={{ marginTop: 'auto' }}>
                    <BuildingCosts />
                </div>

            </div>

            {/* Trade Notification Overlay */}
            {gameState.gameState.tradeOffer && gameState.gameState.tradeOffer.status === 'PENDING' && (
                <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#fff', padding: '20px', boxShadow: '0 0 20px rgba(0,0,0,0.5)', zIndex: 200, borderRadius: '8px', textAlign: 'center' }}>
                    <h3>Trade Offer from {gameState.players.find(p => p.id === gameState.gameState.tradeOffer.from)?.name}</h3>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', margin: '15px 0' }}>
                        <div>
                            <strong>Gives:</strong><br />
                            {Object.entries(gameState.gameState.tradeOffer.give).map(([k, v]) => <div key={k}>{v} {k}</div>)}
                        </div>
                        <div>
                            <strong>Asks:</strong><br />
                            {Object.entries(gameState.gameState.tradeOffer.get).map(([k, v]) => <div key={k}>{v} {k}</div>)}
                        </div>
                    </div>
                    {gameState.gameState.tradeOffer.from !== playerId ? (
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button onClick={handleAcceptTrade} style={{ background: 'green', color: 'white', border: 'none', padding: '10px 20px', cursor: 'pointer', borderRadius: '4px' }}>Accept</button>
                            <button onClick={handleRejectTrade} style={{ background: 'red', color: 'white', border: 'none', padding: '10px 20px', cursor: 'pointer', borderRadius: '4px' }}>Reject</button>
                        </div>
                    ) : (
                        <button onClick={handleRejectTrade} style={{ background: '#666', color: 'white', border: 'none', padding: '10px 20px', cursor: 'pointer', borderRadius: '4px' }}>Cancel</button>
                    )}
                </div>
            )}

            {showTradeModal && myPlayer && (
                <TradeModal
                    onClose={() => setShowTradeModal(false)}
                    onOfferTrade={handleTradeOffer}
                    playerResources={myPlayer.resources}
                />
            )}

            {/* Chat Overlay */}
            {myPlayer && (
                <Chat
                    messages={gameState.gameState.chatMessages || []}
                    onSendMessage={(text) => performAction('SEND_MESSAGE', { message: text })}
                    myPlayerName={myPlayer.name}
                />
            )}
        </div>
    );
};

export default Game;
