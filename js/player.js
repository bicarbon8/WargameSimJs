var WarGame = WarGame || {};
WarGame.Player = function (team, attributes) {
    this.obj = null;
    this.team = team;
    this.attributes = attributes;
    this.stats = new WarGame.Stats();
    this.stats.parse(this.attributes.stats);
    this.boardLocation = null;
    this.history = [];

    this.initialize();
};

WarGame.Player.prototype.initialize = function () {
    this.generateObj();
    this.setColour(this.team.colour);
};

WarGame.Player.prototype.setColour = function (colour) {
    this.obj.material.color.setHex(colour);
};

WarGame.Player.prototype.moveTo = function (coordinates) {
    this.obj.position.set(coordinates.x,coordinates.y,coordinates.z);
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
