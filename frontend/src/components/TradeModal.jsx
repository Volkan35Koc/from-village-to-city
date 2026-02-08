import React, { useState } from 'react';

const RESOURCES = ['WOOD', 'BRICK', 'SHEEP', 'WHEAT', 'ORE'];

const TradeModal = ({ onClose, onOfferTrade, playerResources }) => {
    const [give, setGive] = useState({ WOOD: 0, BRICK: 0, SHEEP: 0, WHEAT: 0, ORE: 0 });
    const [get, setGet] = useState({ WOOD: 0, BRICK: 0, SHEEP: 0, WHEAT: 0, ORE: 0 });
    const [target, setTarget] = useState('BANK'); // 'BANK' or 'PLAYER' (generic for now)

    const handleIncrement = (type, res) => {
        if (type === 'GIVE') {
            if (playerResources[res] > give[res]) {
                setGive({ ...give, [res]: give[res] + 1 });
            }
        } else {
            setGet({ ...get, [res]: get[res] + 1 });
        }
    };

    const handleDecrement = (type, res) => {
        if (type === 'GIVE') {
            if (give[res] > 0) {
                setGive({ ...give, [res]: give[res] - 1 });
            }
        } else {
            if (get[res] > 0) {
                setGet({ ...get, [res]: get[res] - 1 });
            }
        }
    };

    const handleSubmit = () => {
        // Filter out zero values
        const finalGive = Object.fromEntries(Object.entries(give).filter(([_, v]) => v > 0));
        const finalGet = Object.fromEntries(Object.entries(get).filter(([_, v]) => v > 0));

        if (Object.keys(finalGive).length === 0 || Object.keys(finalGet).length === 0) return;

        onOfferTrade({
            give: finalGive,
            get: finalGet,
            to: target
        });
        onClose();
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div style={{ background: 'white', padding: '20px', borderRadius: '8px', minWidth: '500px' }}>
                <h2>Trade Offer</h2>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ flex: 1, marginRight: '10px' }}>
                        <h3>You Give</h3>
                        {RESOURCES.map(res => (
                            <div key={res} style={{ display: 'flex', justifyContent: 'space-between', margin: '5px 0' }}>
                                <span>{res} ({playerResources[res]})</span>
                                <div>
                                    <button onClick={() => handleDecrement('GIVE', res)}>-</button>
                                    <span style={{ margin: '0 10px' }}>{give[res]}</span>
                                    <button onClick={() => handleIncrement('GIVE', res)}>+</button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{ flex: 1, marginLeft: '10px' }}>
                        <h3>You Get</h3>
                        {RESOURCES.map(res => (
                            <div key={res} style={{ display: 'flex', justifyContent: 'space-between', margin: '5px 0' }}>
                                <span>{res}</span>
                                <div>
                                    <button onClick={() => handleDecrement('GET', res)}>-</button>
                                    <span style={{ margin: '0 10px' }}>{get[res]}</span>
                                    <button onClick={() => handleIncrement('GET', res)}>+</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label>Trade With: </label>
                    <select value={target} onChange={(e) => setTarget(e.target.value)}>
                        <option value="BANK">Bank (4:1)</option>
                        <option value="PLAYER">Players (Global Offer)</option>
                    </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button onClick={onClose} style={{ padding: '8px 16px' }}>Cancel</button>
                    <button onClick={handleSubmit} style={{ padding: '8px 16px', background: 'green', color: 'white', border: 'none' }}>Offer Trade</button>
                </div>
            </div>
        </div>
    );
};

export default TradeModal;
