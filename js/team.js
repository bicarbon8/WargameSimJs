var WarGame = WarGame || {};
WarGame.Team = function (name, colour) {
    this.name = name;
    this.colour = colour;
    this.players = [];
    this.remainingPoints = WarGame.POINTS_PER_TEAM;
    this.score = 0;
    this.priority = 0;
};

WarGame.Team.prototype.addPlayer = function (player) {
    this.players.push(player);
};

WarGame.Team.prototype.removePlayer = function (player) {
    this.players = this.players.filter(function (p) {
        return p !== player;
    });
};
