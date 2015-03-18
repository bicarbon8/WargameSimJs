var WarGame = WarGame || {};
WarGame.Teams = WarGame.Teams || {};
WarGame.Teams.Team = function (name, colour, points) {
    this.name = name;
    this.colour = colour;
    this.players = [];
    this.originalPoints = points;
    this.remainingPoints = this.originalPoints;
    this.score = 0;
    this.priority = 0;
};

WarGame.Teams.Team.prototype.addPlayer = function (player) {
    if (this.remainingPoints - player.getCost() >= 0) {
        this.remainingPoints -= player.getCost();
        player.setTeam(this);
        this.players.push(player);
    } else {
        throw "not enough points to add player.";
    }
};

WarGame.Teams.Team.prototype.removePlayer = function (player) {
    this.players = this.players.filter(function (p) {
        return p !== player;
    });
};

WarGame.Teams.Team.prototype.getPlayers = function () {
    return this.players;
};

WarGame.Teams.Team.prototype.reset = function () {
    this.players = [];
    this.score = 0;
    this.priority = 0;
    this.remainingPoints = this.originalPoints;
};
