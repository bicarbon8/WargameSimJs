WarGame.Players = WarGame.Players || [];
WarGame.Players.add({
    name: 'heavy',
    cost: 20,
    width: 1, // x
    height: 0.8, // y
    move: 3,
    shoot: 6,
    effect: null,
    stats: {
        mele: 5,
        ranged: 5,
        strength: 5,
        defense: 7,
        attacks: 1,
        wounds: 3,
        courage: 5,
        might: 1,
        will: 1,
        fate: 0,
    },
});
