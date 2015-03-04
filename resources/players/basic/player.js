WarGame.Players = WarGame.Players || [];
WarGame.Players.push({
    name: 'basic',
    cost: 10,
    width: 0.8, // x
    height: 1, // y
    stats: {
        fight: {
            mele: 3,
            ranged: {
                points: 0,
                distance: 0,
            }
        },
        strength: 3,
        defense: 5,
        attacks: 1,
        wounds: 2,
        courage: 3,
        move: 5,
        effect: null,
    },
});
