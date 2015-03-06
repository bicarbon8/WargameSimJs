WarGame.Players = WarGame.Players || [];
WarGame.Players.push({
    name: 'heavy',
    cost: 20,
    width: 1, // x
    height: 0.8, // y
    stats: {
        fight: {
            mele: 5,
            ranged: {
                points: 0,
                distance: 0,
            }
        },
        strength: 5,
        defense: 7,
        attacks: 1,
        wounds: 3,
        courage: 5,
        move: 3,
        might: 1,
        will: 1,
        fate: 0,
        effect: null,
    },
});
