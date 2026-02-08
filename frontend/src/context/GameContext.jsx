import React, { createContext, useContext, useEffect, useState } from 'react';
import { SocketContext } from './SocketContext';

export const GameContext = createContext();

export const GameProvider = ({ children }) => {
    const socket = useContext(SocketContext);
    const [gameState, setGameState] = useState(null);
    const [playerId, setPlayerId] = useState(null);

    useEffect(() => {
        if (!socket) return;

        socket.on('connect', () => {
            console.log('Connected to server');
            setPlayerId(socket.id);
        });

        socket.on('gameStarted', (state) => {
            console.log('Game Started:', state);
            setGameState(state);
        });

        socket.on('gameUpdate', (state) => {
            console.log('Game Update:', state);
            setGameState(state);
        });

        return () => {
            socket.off('connect');
            socket.off('gameStarted');
            socket.off('gameUpdate');
        };
    }, [socket]);

    const joinGame = (roomId, playerName) => {
        if (socket) {
            socket.emit('joinGame', roomId, playerName);
        }
    };

    const createGame = (playerName) => {
        if (socket) {
            socket.emit('createGame', null, playerName); // Backend expects (roomName, playerName)
        }
    };

    const performAction = (action, payload) => {
        if (socket && gameState) {
            socket.emit('gameAction', { roomId: gameState.roomId, action, payload });
        }
    };

    return (
        <GameContext.Provider value={{ gameState, playerId, joinGame, createGame, performAction }}>
            {children}
        </GameContext.Provider>
    );
};
