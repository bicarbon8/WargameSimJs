var WarGame = WarGame || {};
WarGame.Rounds = WarGame.Rounds || {};
WarGame.Rounds.History = function () {
    this.priority = false;
    this.move = {
        loc: null,
        boardLoc: null,
    };
    this.shoot = {
        wounds: -1,
        done: false,
    };
    this.fight = {
        wounds: -1,
    };
};
