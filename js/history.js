var WarGame = WarGame || {};
WarGame.History = function () {
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
