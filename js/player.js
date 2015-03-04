var WarGame = WarGame || {};
WarGame.Player = function (obj, team, attributes) {
    this.obj = obj;
    this.team = team;
    this.attributes = attributes;
    this.currentLocation = new THREE.Vector3(0,0,0);
    this.previousLocation = this.currentLocation.clone();

    this.initialize();
};

WarGame.Player.prototype.initialize = function () {
    this.setColour(this.team.colour);
};

WarGame.Player.prototype.setColour = function (colour) {
    this.obj.material.color.setHex(colour);
};

WarGame.Player.prototype.moveTo = function (coordinates) {
    var matrix = new THREE.Matrix4();
    matrix.makeTranslation(
        coordinates.x,
        coordinates.y,
        coordinates.z
    );
    this.obj.applyMatrix(matrix);
};
