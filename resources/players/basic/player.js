WarGame.Players = WarGame.Players || [];
WarGame.Players.push({
    name: 'Basic',
    width: 0.8, // x
    height: 1, // y
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
