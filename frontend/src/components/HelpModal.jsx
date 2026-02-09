import React from 'react';

const HelpModal = ({ onClose }) => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div style={{
                background: 'white',
                padding: '30px',
                borderRadius: '10px',
                width: '600px',
                maxHeight: '80vh',
                overflowY: 'auto',
                position: 'relative'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'none',
                        border: 'none',
                        fontSize: '1.5em',
                        cursor: 'pointer'
                    }}
                >
                    ✕
                </button>

                <h2 style={{ textAlign: 'center', color: '#2c3e50' }}>How to Play Catan.io</h2>

                <h3>Goal</h3>
                <p>The first player to reach <strong>10 Victory Points (VP)</strong> wins.</p>
                <ul>
                    <li>Settlement = 1 VP</li>
                    <li>City = 2 VP</li>
                    <li>Longest Road = 2 VP</li>
                    <li>Largest Army = 2 VP</li>
                    <li>VP Development Cards = 1 VP</li>
                </ul>

                <h3>Game Phases</h3>
                <ol>
                    <li><strong>Setup:</strong> Place 2 Settlements and 2 Roads.</li>
                    <li><strong>Roll Dice:</strong> Resources are distributed based on the roll.</li>
                    <li><strong>Trade:</strong> Trade resources with other players or the bank (4:1).</li>
                    <li><strong>Build:</strong> Spend resources to build roads, settlements, cities, or buy dev cards.</li>
                </ol>

                <h3>Building Costs</h3>
                <ul>
                    <li><strong>Road:</strong> 1 Wood, 1 Brick</li>
                    <li><strong>Settlement:</strong> 1 Wood, 1 Brick, 1 Wheat, 1 Sheep</li>
                    <li><strong>City:</strong> 2 Wheat, 3 Ore</li>
                    <li><strong>Dev Card:</strong> 1 Wheat, 1 Sheep, 1 Ore</li>
                </ul>

                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '10px 20px',
                            background: '#3498db',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        Got it!
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HelpModal;
