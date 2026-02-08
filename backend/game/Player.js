class Player {
    constructor(id, name, colorIndex) {
        this.id = id;
        this.name = name;
        this.colorIndex = colorIndex; // 0-3 (Red, Blue, Orange, White)
        this.resources = {
            wood: 0,
            brick: 0,
            sheep: 0,
            wheat: 0,
            ore: 0
        };
        this.victoryPoints = 0;
        this.roads = 0;
        this.settlements = 0;
        this.cities = 0;
        this.devCards = []; // Array of { type: 'KNIGHT', used: false, isNew: true }
        this.playedDevCards = [];
        this.knightsPlayed = 0;
    }

    canAfford(cost) {
        for (const [resource, amount] of Object.entries(cost)) {
            if ((this.resources[resource] || 0) < amount) {
                return false;
            }
        }
        return true;
    }

    pay(cost) {
        if (!this.canAfford(cost)) return false;

        for (const [resource, amount] of Object.entries(cost)) {
            this.resources[resource] -= amount;
        }
        return true;
    }

    addResources(resource, amount) {
        if (this.resources.hasOwnProperty(resource)) {
            this.resources[resource] += amount;
        }
    }
}

module.exports = Player;
