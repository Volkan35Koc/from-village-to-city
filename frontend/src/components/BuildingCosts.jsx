import React from 'react';

const BuildingCosts = () => {
    const costs = [
        { name: 'Road', cost: { wood: 1, brick: 1 } },
        { name: 'Settlement', cost: { wood: 1, brick: 1, wheat: 1, sheep: 1 } },
        { name: 'City', cost: { wheat: 2, ore: 3 } },
        { name: 'Dev Card', cost: { wheat: 1, sheep: 1, ore: 1 } },
    ];

    return (
        <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            fontSize: '0.85em',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
        }}>
            <h4 style={{ margin: '0 0 5px 0', borderBottom: '1px solid #ccc' }}>Building Costs</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {costs.map(item => (
                    <li key={item.name} style={{ marginBottom: '5px' }}>
                        <strong>{item.name}:</strong> <br />
                        {Object.entries(item.cost).map(([res, amount]) => (
                            <span key={res} style={{ marginRight: '5px', color: '#555' }}>
                                {amount} {res}
                            </span>
                        ))}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default BuildingCosts;
