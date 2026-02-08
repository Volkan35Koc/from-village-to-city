class Board {
    constructor() {
        this.tiles = []; // Array of { q, r, s, resource, number, id }
        this.intersections = {}; // Map of "x,y" -> { id, x, y, owner, type, adj: [] }
        this.roads = {}; // Map of "x1,y1;x2,y2" -> { id, x1, y1, x2, y2, owner }
        this.robberPosition = null; // Tile ID where robber is
        this.initBoard();
    }

    initBoard() {
        // Standard Catan Tile Counts
        const resources = [
            'WOOD', 'WOOD', 'WOOD', 'WOOD',
            'SHEEP', 'SHEEP', 'SHEEP', 'SHEEP',
            'WHEAT', 'WHEAT', 'WHEAT', 'WHEAT',
            'BRICK', 'BRICK', 'BRICK',
            'ORE', 'ORE', 'ORE',
            'DESERT'
        ];

        let shuffledResources = this.shuffle([...resources]);
        let numbers = [5, 2, 6, 3, 8, 10, 9, 12, 11, 4, 8, 10, 9, 4, 5, 6, 3, 11];

        const layout = [];
        for (let q = -2; q <= 2; q++) {
            for (let r = -2; r <= 2; r++) {
                if (Math.abs(q + r) <= 2) {
                    layout.push({ q, r, s: -q - r });
                }
            }
        }

        let numIndex = 0;
        this.tiles = layout.map((hex, index) => {
            const resource = shuffledResources[index];
            let number = null;
            if (resource !== 'DESERT') {
                number = numbers[numIndex % numbers.length];
                numIndex++;
            } else {
                this.robberPosition = index;
            }

            return {
                id: index,
                q: hex.q,
                r: hex.r,
                s: hex.s,
                resource,
                number
            };
        });

        this.generateIntersections();
    }

    shuffle(array) {
        let currentIndex = array.length, randomIndex;
        while (currentIndex != 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [
                array[randomIndex], array[currentIndex]];
        }
        return array;
    }

    generateIntersections() {
        const HEX_SIZE = 60; // Must match frontend
        const hexToPixel = (q, r) => {
            const x = HEX_SIZE * (Math.sqrt(3) * q + Math.sqrt(3) / 2 * r);
            const y = HEX_SIZE * (3 / 2 * r);
            return { x, y };
        };

        const getHexCorners = (center) => {
            const corners = [];
            for (let i = 0; i < 6; i++) {
                const angle_deg = 60 * i + 30;
                const angle_rad = Math.PI / 180 * angle_deg;
                corners.push({
                    x: center.x + HEX_SIZE * Math.cos(angle_rad),
                    y: center.y + HEX_SIZE * Math.sin(angle_rad)
                });
            }
            return corners;
        };

        this.tiles.forEach(tile => {
            const center = hexToPixel(tile.q, tile.r);
            const corners = getHexCorners(center);

            corners.forEach((corner, i) => {
                const key = `${Math.round(corner.x)},${Math.round(corner.y)}`;

                // Initialize intersection if not exists
                if (!this.intersections[key]) {
                    this.intersections[key] = {
                        id: key,
                        x: corner.x,
                        y: corner.y,
                        owner: null,
                        type: null,
                        adj: [] // Neighbor intersection IDs
                    };
                }

                // Identify neighbors via edges
                const nextCorner = corners[(i + 1) % 6];
                const nextKey = `${Math.round(nextCorner.x)},${Math.round(nextCorner.y)}`;

                // Initialize next intersection if not exists (to ensure we can add to its adj)
                if (!this.intersections[nextKey]) {
                    this.intersections[nextKey] = {
                        id: nextKey,
                        x: nextCorner.x,
                        y: nextCorner.y,
                        owner: null,
                        type: null,
                        adj: []
                    };
                }

                // Add adjacency (undirected graph)
                if (!this.intersections[key].adj.includes(nextKey)) {
                    this.intersections[key].adj.push(nextKey);
                }
                if (!this.intersections[nextKey].adj.includes(key)) {
                    this.intersections[nextKey].adj.push(key);
                }

                // Add edge to map
                const edgeKey = [key, nextKey].sort().join(';');
                if (!this.roads[edgeKey]) {
                    this.roads[edgeKey] = {
                        id: edgeKey,
                        x1: corner.x,
                        y1: corner.y,
                        x2: nextCorner.x,
                        y2: nextCorner.y,
                        owner: null
                    };
                }
            });
        });
    }

    placeSettlement(playerId, intersectionId) {
        const intersection = this.intersections[intersectionId];
        if (!intersection) return false;
        if (intersection.owner !== null) return false; // Already occupied

        // Distance Rule: No settlement on adjacent intersections
        for (const neighborId of intersection.adj) {
            if (this.intersections[neighborId].owner !== null) {
                return false;
            }
        }

        // Connectivity Rule (TODO: skip for setup phase)
        // Check if connected to a road owned by player
        let connected = false;
        // Also check if it's the very first settlement (setup phase logic handled in Game.js state)
        // For strict rules, we need Game state passed or a flag. 
        // For MVP, enable logic: if player has 0 settlements, placement is free? 
        // Better: Game.js calls this and validation happens there or here with a flag.

        // Let's assume strict connectivity unless 'isSetup' flag passed?
        // Updating signature to accept isSetup... but keeping simple for now.
        // We will check connectivity in Game.js or here by checking standard roads.

        // For now, allow placement if:
        // 1. Setup phase (handled by caller logic) OR
        // 2. Connected to own road

        // I'll return true for now and handle phase-specific logic in Game.js
        intersection.owner = playerId;
        intersection.type = 'SETTLEMENT';
        return true;
    }

    placeRoad(playerId, edgeId) {
        const road = this.roads[edgeId];
        if (!road) return false;
        if (road.owner !== null) return false;

        // Connectivity: Must connect to player's road or settlement/city
        // ... (complex check)

        // Simple MVP check: just claim it
        road.owner = playerId;
        return true;
    }

    getIntersectionsForTile(tile) {
        const HEX_SIZE = 60;
        const hexToPixel = (q, r) => {
            const x = HEX_SIZE * (Math.sqrt(3) * q + Math.sqrt(3) / 2 * r);
            const y = HEX_SIZE * (3 / 2 * r);
            return { x, y };
        };
        const getHexCorners = (center) => {
            const corners = [];
            for (let i = 0; i < 6; i++) {
                const angle_deg = 60 * i + 30;
                const angle_rad = Math.PI / 180 * angle_deg;
                corners.push({
                    x: center.x + HEX_SIZE * Math.cos(angle_rad),
                    y: center.y + HEX_SIZE * Math.sin(angle_rad)
                });
            }
            return corners;
        };

        const center = hexToPixel(tile.q, tile.r);
        const corners = getHexCorners(center);

        return corners.map(corner => {
            const key = `${Math.round(corner.x)},${Math.round(corner.y)}`;
            return this.intersections[key];
        }).filter(i => i !== undefined);
    }

    getState() {
        return {
            tiles: this.tiles,
            intersections: this.intersections,
            roads: this.roads,
            robberPosition: this.robberPosition
        };
    }

    getLongestRoad(playerId) {
        const playerRoads = Object.values(this.roads).filter(r => r.owner === playerId);
        if (playerRoads.length === 0) return 0;

        let maxLength = 0;
        const visitedEdges = new Set();

        const getAdjacencyList = () => {
            const adj = {};
            playerRoads.forEach(road => {
                const k1 = `${Math.round(road.x1)},${Math.round(road.y1)}`;
                const k2 = `${Math.round(road.x2)},${Math.round(road.y2)}`;
                if (!adj[k1]) adj[k1] = [];
                if (!adj[k2]) adj[k2] = [];
                adj[k1].push({ to: k2, id: road.id });
                adj[k2].push({ to: k1, id: road.id });
            });
            return adj;
        };

        const adj = getAdjacencyList();

        // DFS function
        const dfs = (node, currentLength, visited) => {
            if (currentLength > maxLength) maxLength = currentLength;

            if (!adj[node]) return;

            adj[node].forEach(neighbor => {
                if (!visited.has(neighbor.id)) {
                    // Check if broken by enemy settlement (not fully implemented here as we need intersection owner info)
                    // In strict rules, an enemy settlement breaks the road. 
                    // We can check intersection owner if we map node key to intersection ID.
                    // For MVP, we ignore settlement interruptions or check purely road continuity.

                    visited.add(neighbor.id);
                    dfs(neighbor.to, currentLength + 1, visited);
                    visited.delete(neighbor.id); // Backtrack
                }
            });
        };

        // Try starting from every endpoint (node with odd degree or degree 1) or just every node to be safe
        // Simply optimizing: iterate all nodes
        Object.keys(adj).forEach(node => {
            // Optimization: start only if node degree is odd or we haven't visited its edges? 
            // Brute force DFS from all nodes is safe for small N (~15 roads max usually).
            dfs(node, 0, new Set());
        });

        return maxLength;
    }
}

module.exports = Board;
