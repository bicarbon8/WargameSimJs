var WarGame = WarGame || {};
WarGame.Player = function (obj, team, attributes) {
    this.obj = obj;
    this.team = team;
    this.attributes = attributes;

    this.initialize();
};

WarGame.Player.prototype.initialize = function () {
    for(var i in this.obj.children) {
        var child = this.obj.children[i];
        child.material.color.setHex(this.team);
    }
};
