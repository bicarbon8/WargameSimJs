WarGame.Players = WarGame.Players || [];
WarGame.Players.push({
    name: 'hero',
    cost: 50,
    width: 0.9, // x
    height: 1.2, // y
    move: 6,
    shoot: 15,
    effect: null,
    stats: {
        mele: 6,
        ranged: 1,
        strength: 5,
        defense: 7,
        attacks: 2,
        wounds: 3,
        courage: 6,
        might: 2,
        will: 2,
        fate: 2,
    },
});
