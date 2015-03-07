var WarGame = WarGame || {};
WarGame.Player = function (obj, team, attributes) {
    this.obj = obj;
    this.team = team;
    this.attributes = attributes;
    this.boardLocation = null;

    this.initialize();
};

WarGame.Player.prototype.initialize = function () {
    this.setColour(this.team.colour);
};

WarGame.Player.prototype.setColour = function (colour) {
    this.obj.material.color.setHex(colour);
};

WarGame.Player.prototype.moveTo = function (coordinates) {
    this.obj.position.set(coordinates.x,coordinates.y,coordinates.z);
};

WarGame.Player.prototype.wound = function () {
    this.attributes.stats.wounds--;
    if (this.attributes.stats.wounds < 1) {
        // you are dead
        alert("Team: " + this.team.name + " player defeated!");
        WarGame.removePlayer(this);
    }
};
