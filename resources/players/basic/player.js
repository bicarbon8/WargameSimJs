WarGame.Players = WarGame.Players || [];
WarGame.Players.push({
    name: 'Basic',
    width: 0.5, // x
    height: 2, // y
    depth: 0.5, // z
    stats: {
        attack: {
            mele: 2,
            ranged: null,
            magic: null
        },
        defense: {
            mele: 2,
            ranged: 3,
            magic: 1
        },
        effect: null,
        hp: 4,
        mana: 0,
        special: 0,
        speed: 5
    }
});
