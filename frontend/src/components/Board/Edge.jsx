import React from 'react';
import { Line } from 'react-konva';

const Edge = ({ x1, y1, x2, y2, id, color, onClick }) => {
    return (
        <Line
            points={[x1, y1, x2, y2]}
            stroke={color || "black"}
            strokeWidth={color ? 6 : 4}
            opacity={color ? 1 : 0.3}
            onMouseEnter={(e) => {
                if (!color) e.target.opacity(0.8);
            }}
            onMouseLeave={(e) => {
                if (!color) e.target.opacity(0.3);
            }}
            onClick={() => onClick(id)}
        />
    );
};

export default Edge;
