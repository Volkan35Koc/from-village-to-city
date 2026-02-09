import React, { useState } from 'react';

const BotSetup = ({ onCreateGame, onBack }) => {
    const [botCount, setBotCount] = useState(3);
    const [playerName, setPlayerName] = useState('Human');

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
            <div style={{
                background: 'white',
                padding: '40px',
                borderRadius: '10px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                width: '400px',
                textAlign: 'center'
            }}>
                <h2 style={{ marginBottom: '30px' }}>Setup Bot Game</h2>

                <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Your Name:</label>
                    <input
                        type="text"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                    />
                </div>

                <div style={{ marginBottom: '30px', textAlign: 'left' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Number of Bots:</label>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        {[1, 2, 3].map(num => (
                            <button
                                key={num}
                                onClick={() => setBotCount(num)}
                                style={{
                                    flex: 1,
                                    margin: '0 5px',
                                    padding: '10px',
                                    borderRadius: '5px',
                                    border: '1px solid #3498db',
                                    background: botCount === num ? '#3498db' : 'white',
                                    color: botCount === num ? 'white' : '#3498db',
                                    cursor: 'pointer'
                                }}
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={onBack}
                        style={{
                            flex: 1,
                            padding: '12px',
                            background: '#95a5a6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        Back
                    </button>
                    <button
                        onClick={() => onCreateGame(playerName, botCount)}
                        style={{
                            flex: 1,
                            padding: '12px',
                            background: '#2ecc71',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        Start Game
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BotSetup;
