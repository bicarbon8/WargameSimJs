WarGame.Players = WarGame.Players || [];
WarGame.Players.push({
    name: 'light',
    cost: 10,
    width: 0.5, // x
    height: 1.2, // y
    move: 6,
    shoot: 15,
    effect: null,
    stats: {
        mele: 1,
        ranged: 2,
        strength: 1,
        defense: 2,
        attacks: 1,
        wounds: 1,
        courage: 1,
        might: 0,
        will: 0,
        fate: 0,
    },
});
