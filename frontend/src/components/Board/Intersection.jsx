import React from 'react';
import { Circle } from 'react-konva';

const Intersection = ({ x, y, id, color, type, onClick }) => {
    return (
        <Circle
            x={x}
            y={y}
            radius={type === 'CITY' ? 12 : 8}
            fill={color || "rgba(255, 255, 255, 0.5)"}
            stroke="black"
            strokeWidth={1}
            onMouseEnter={(e) => {
                if (!color) e.target.fill('rgba(255, 255, 255, 0.8)');
            }}
            onMouseLeave={(e) => {
                if (!color) e.target.fill('rgba(255, 255, 255, 0.5)');
            }}
            onClick={() => onClick(id)}
        />
    );
};

export default Intersection;
