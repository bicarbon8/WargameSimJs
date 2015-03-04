WarGame.Players = WarGame.Players || [];
WarGame.Players.push({
    name: 'light',
    cost: 10,
    width: 0.5, // x
    height: 1.2, // y
    stats: {
        fight: {
            mele: 1,
            ranged: {
                points: 1,
                distance: 15,
            }
        },
        strength: 1,
        defense: 2,
        attacks: 1,
        wounds: 1,
        courage: 1,
        move: 6,
        effect: null,
    },
});
