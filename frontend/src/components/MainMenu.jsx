import React, { useState } from 'react';

const MainMenu = ({ onPlayBots, onPlayOnline, onShowHelp }) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            fontFamily: 'sans-serif',
            background: '#f0f2f5'
        }}>
            <h1 style={{ fontSize: '4em', color: '#2c3e50', marginBottom: '40px' }}>Catan.io</h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '300px' }}>
                <button
                    onClick={onPlayBots}
                    style={{
                        padding: '15px',
                        fontSize: '1.2em',
                        cursor: 'pointer',
                        background: '#e67e22',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                >
                    Play vs Bots 🤖
                </button>

                <button
                    onClick={onPlayOnline}
                    style={{
                        padding: '15px',
                        fontSize: '1.2em',
                        cursor: 'pointer',
                        background: '#3498db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                >
                    Play Online 🌍
                </button>

                <button
                    onClick={onShowHelp}
                    style={{
                        padding: '15px',
                        fontSize: '1.2em',
                        cursor: 'pointer',
                        background: '#2ecc71',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                >
                    How to Play 📜
                </button>
            </div>
        </div>
    );
};

export default MainMenu;
