WarGame.Players = WarGame.Players || [];
WarGame.Players.push({
    name: 'light',
    cost: 10,
    width: 0.5, // x
    height: 1.2, // y
    move: 7,
    shoot: 14,
    effect: null,
    stats: {
        mele: 1,
        ranged: 1,
        strength: 2,
        defense: 2,
        attacks: 1,
        wounds: 1,
        courage: 1,
        might: 0,
        will: 0,
        fate: 0,
    },
});
