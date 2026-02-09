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
            setPlayerId(socket.id);
        });

        socket.on('gameStarted', (state) => {
            setGameState(state);
        });

        socket.on('gameJoined', ({ gameState }) => {
            setGameState(gameState);
        });

        socket.on('gameUpdate', (state) => {
            setGameState(state);
        });

        socket.on('error', (msg) => {
            alert(msg);
        });

        return () => {
            socket.off('connect');
            socket.off('gameStarted');
            socket.off('gameJoined');
            socket.off('gameUpdate');
            socket.off('error');
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

    const createGameWithBots = (playerName, botCount) => {
        if (socket) {
            socket.emit('createGameWithBots', playerName, botCount);
        }
    };

    const performAction = (action, payload) => {
        if (socket && gameState) {
            socket.emit('gameAction', { roomId: gameState.roomId, action, payload });
        }
    };

    return (
        <GameContext.Provider value={{ gameState, playerId, joinGame, createGame, createGameWithBots, performAction }}>
            {children}
        </GameContext.Provider>
    );
};
