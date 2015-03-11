var WarGame = WarGame || {};
WarGame.Player = function (team, attributes) {
    this.id = WarGame.Utils.newId();
    this.obj = null;
    this.team = team;
    this.attributes = attributes;
    this.stats = new WarGame.Stats();
    this.boardLocation = null;
    this.history = []; // used to track actions in each round of play

    this.initialize();
};

WarGame.Player.prototype.initialize = function () {
    this.stats.parse(this.attributes.stats);
    this.generateObj();
    this.setColour(this.team.colour);
    this.history.push(new WarGame.History());
};

WarGame.Player.prototype.setColour = function (colour) {
    this.obj.material.color.setHex(colour);
};

WarGame.Player.prototype.moveTo = function (coordinates, overrideLimit) {
    // ensure we can move this far by comparing location at start of round
    var dist = 0;
    if (!overrideLimit) {
        dist = WarGame.map.getDistanceBetweenTwoPoints(
            this.history[WarGame.CURRENT_ROUND].move.loc,
            coordinates);
    }

    if (overrideLimit || dist <= this.attributes.move) {
        this.boardLocation = WarGame.Utils.coordinatesToBoardLoc(coordinates);
        this.obj.position.set(coordinates.x,coordinates.y,coordinates.z);
    } else {
        throw "distance too far. player can only move: " + this.attributes.move;
    }
};

WarGame.Player.prototype.isBattling = function () {
    var opponents = WarGame.map.getOpponentsInMeleRange(this);
    if (opponents.length > 0) {
        return true;
    }
    return false;
};

WarGame.Player.prototype.wound = function () {
    this.stats.wounds--;
    if (this.stats.wounds < 1) {
        // you are dead
        alert("Team: " + this.team.name + ": " + this.attributes.name + " player defeated!");
        WarGame.removePlayer(this);
    }
};

WarGame.Player.prototype.generateObj = function () {
    var playerGeometry = new THREE.Geometry();
    var matrix = new THREE.Matrix4();

    // base
    var geometry = new THREE.CylinderGeometry(
        0.4, // top radius
        0.5, // bottom radius
        0.2, // length
        4,  // circle segments
        1,   // length segments
        false); // open
    matrix.makeTranslation(0, 0.1, 0);
    playerGeometry.merge(geometry, matrix);

    // body
    geometry = new THREE.CylinderGeometry(
        this.attributes.width / 2, // top radius
        0.1, // bottom radius
        this.attributes.height, // length
        6,  // circle segments
        1,   // length segments
        false); // open
    matrix.makeTranslation(0, (this.attributes.height / 2) + 0.1, 0);
    playerGeometry.merge(geometry, matrix);

    // head
    var headRadius = (this.attributes.width / 2) - 0.1;
    geometry = new THREE.SphereGeometry(
        headRadius, // radius
        6,  // width segments
        6); // height segments
    matrix.makeTranslation(0, (this.attributes.height / 2) + 0.1 + ((this.attributes.height / 2) + (this.attributes.width / 2)), 0);
    playerGeometry.merge(geometry, matrix);

    var playerMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 }); // gray (set later)
    var playerObj = new THREE.Mesh(playerGeometry, playerMaterial);
    playerObj.castShadow = true;

    this.obj = playerObj;
};
