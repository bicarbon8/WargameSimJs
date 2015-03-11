WarGame.Players = WarGame.Players || [];
WarGame.Players.push({
    name: 'basic',
    cost: 15,
    width: 0.8, // x
    height: 1, // y
    move: 5,
    shoot: 10,
    effect: null,
    stats: {
        mele: 3,
        ranged: 5,
        strength: 3,
        defense: 5,
        attacks: 1,
        wounds: 2,
        courage: 3,
        might: 0,
        will: 0,
        fate: 0,
    },
});
