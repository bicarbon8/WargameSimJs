WarGame.Players = WarGame.Players || [];
WarGame.Players.push({
    name: 'hero',
    cost: 50,
    width: 0.9, // x
    height: 1.2, // y
    stats: {
        fight: {
            mele: 6,
            ranged: {
                points: 1,
                distance: 15,
            }
        },
        strength: 5,
        defense: 7,
        attacks: 2,
        wounds: 3,
        courage: 6,
        move: 6,
        might: 2,
        will: 2,
        fate: 2,
        effect: null,
    },
});
