import React from 'react';
import { Stage, Layer } from 'react-konva';
import Hex from './Hex';
import Intersection from './Intersection';
import Edge from './Edge';

const HEX_SIZE = 60;
const START_X = 400; // Center of canvas horizontally
const START_Y = 300; // Center of canvas vertically

const HexGrid = ({ board, players, onIntersectionClick, onEdgeClick, onHexClick }) => {
    if (!board || !board.tiles) return null;

    const hexToPixel = (q, r) => {
        const x = HEX_SIZE * (Math.sqrt(3) * q + Math.sqrt(3) / 2 * r);
        const y = HEX_SIZE * (3 / 2 * r);
        return { x: x + START_X, y: y + START_Y };
    };

    const handleIntersectionClick = (id) => {
        if (onIntersectionClick) onIntersectionClick(id);
    };

    const handleEdgeClick = (id) => {
        if (onEdgeClick) onEdgeClick(id);
    };

    const handleHexClick = (id) => {
        if (onHexClick) onHexClick(id);
    };

    const getPlayerColor = (ownerId) => {
        if (!ownerId || !players) return null;
        const player = players.find(p => p.id === ownerId);
        return player ? ['red', 'blue', 'orange', 'black'][player.colorIndex] : null;
    };

    // Use backend data directly but apply offset
    const intersections = board.intersections ? Object.values(board.intersections).map(i => ({
        ...i,
        x: i.x + START_X,
        y: i.y + START_Y
    })) : [];

    const roads = board.roads ? Object.values(board.roads).map(r => ({
        ...r,
        x1: r.x1 + START_X,
        y1: r.y1 + START_Y,
        x2: r.x2 + START_X,
        y2: r.y2 + START_Y
    })) : [];

    return (
        <Stage width={800} height={600}>
            <Layer>
                {/* 1. Hexes */}
                {board.tiles.map((tile) => {
                    const { x, y } = hexToPixel(tile.q, tile.r);
                    return (
                        <Hex
                            key={tile.id}
                            x={x}
                            y={y}
                            size={HEX_SIZE}
                            resource={tile.resource}
                            number={tile.number}
                            id={tile.id}
                            isRobber={board.robberPosition === tile.id}
                            onClick={handleHexClick}
                        />
                    );
                })}

                {/* 2. Edges */}
                {roads.map(edge => (
                    <Edge
                        key={edge.id}
                        {...edge}
                        color={getPlayerColor(edge.owner)}
                        onClick={() => handleEdgeClick(edge.id)}
                    />
                ))}

                {/* 3. Intersections */}
                {intersections.map(intersection => (
                    <Intersection
                        key={intersection.id}
                        {...intersection}
                        color={getPlayerColor(intersection.owner)}
                        onClick={() => handleIntersectionClick(intersection.id)}
                    />
                ))}
            </Layer>
        </Stage>
    );
};

export default HexGrid;
