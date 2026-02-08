import React from 'react';
import { RegularPolygon, Text, Circle, Group } from 'react-konva';

const RESOURCE_COLORS = {
    WOOD: '#228B22',   // Forest Green
    BRICK: '#B22222',  // Firebrick
    SHEEP: '#90EE90',  // Light Green
    WHEAT: '#FFD700',  // Gold
    ORE: '#708090',    // Slate Gray
    DESERT: '#F4A460'  // Sandy Brown
};

const Hex = ({ x, y, size, resource, number, id, isRobber, onClick }) => {
    return (
        <Group x={x} y={y} onClick={() => onClick && onClick(id)}>
            <RegularPolygon
                sides={6}
                radius={size}
                fill={RESOURCE_COLORS[resource] || '#CCCCCC'}
                stroke="black"
                strokeWidth={1}
                rotation={30} // Pointy top
            />
            {number && (
                <Group>
                    <Circle
                        radius={size * 0.4}
                        fill="white"
                        stroke="black"
                        strokeWidth={1}
                    />
                    <Text
                        text={number.toString()}
                        fontSize={size * 0.4}
                        fontStyle="bold"
                        align="center"
                        verticalAlign="middle"
                        offsetX={size * 0.15} // Approximate centering
                        offsetY={size * 0.2}
                        fill={number === 6 || number === 8 ? 'red' : 'black'}
                    />
                </Group>
            )}

            {/* Visual Debug / Coordinate info */}
            {/* <Text
                text={id.toString()}
                y={size * 0.6}
                fontSize={10}
                align="center"
                 offsetX={5}
            /> */}

            {isRobber && (
                <Circle radius={15} fill="black" y={size * 0.5} opacity={0.8} />
            )}
        </Group>
    );
};

export default Hex;
