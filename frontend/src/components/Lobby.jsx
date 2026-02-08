import React, { useContext, useState } from 'react';
import { GameContext } from '../context/GameContext';

const Lobby = () => {
    const { joinGame, createGame, playerId } = useContext(GameContext);
    const [roomId, setRoomId] = useState('');
    const [playerName, setPlayerName] = useState('Player ' + Math.floor(Math.random() * 100));

    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>Catan.io</h1>
            <p>Your ID: {playerId}</p>

            <div style={{ marginBottom: '20px' }}>
                <input
                    type="text"
                    placeholder="Enter Player Name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                />
            </div>

            <div style={{ margin: '10px' }}>
                <button onClick={() => createGame(playerName)}>Create New Game</button>
            </div>

            <div style={{ margin: '10px' }}>
                <input
                    type="text"
                    placeholder="Enter Room ID"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                />
                <button onClick={() => joinGame(roomId, playerName)}>Join Game</button>
            </div>
        </div>
    );
};

export default Lobby;
