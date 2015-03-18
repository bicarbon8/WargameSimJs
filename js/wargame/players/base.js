var WarGame = WarGame || {};
WarGame.Players = WarGame.Players || {};
WarGame.Players.Base = function (attributes) {
    this.id = WarGame.Utils.newId();
    this.obj = null;
    this.team = null;
    this.attributes = attributes;
    this.stats = new WarGame.Players.Stats();
    this.location = new WarGame.Players.Location(-1, -1, -1);
    this.history = []; // used to track actions in each round of play
    this.history.push(new WarGame.Rounds.History());

    this.initialize();
};

WarGame.Players.Base.prototype.initialize = function () {
    if (this.attributes && this.attributes.stats) {
        this.stats.parse(this.attributes.stats);
        this.generateObj();
    }
};

WarGame.Players.Base.prototype.setColour = function (colour) {
    this.obj.material.color.setHex(colour);
};

WarGame.Players.Base.prototype.setTeam = function (team) {
    this.team = team;
    this.setColour(this.team.colour);
};

WarGame.Players.Base.prototype.moveTo = function (location, overrideLimit) {
    // ensure we can move this far by comparing location at start of round
    var coordinates = location.toVector();
    var dist = 0;
    if (!overrideLimit) {
        dist = WarGame.Maps.getCurrent().getDistanceBetweenTwoPoints(
            this.history[WarGame.Rounds.getCurrent()].move.loc,
            coordinates);
    }

    if (overrideLimit || dist <= this.attributes.move) {
        this.location = location.clone();
        if (this.obj) {
            this.obj.position.set(coordinates.x,coordinates.y,coordinates.z);
        }
    } else {
        throw "distance too far. player can only move: " + this.attributes.move;
    }
};

WarGame.Players.Base.prototype.isBattling = function () {
    var opponents = this.getOpponentsInMeleRange();
    if (opponents.length > 0) {
        return true;
    }
    return false;
};

/**
 * function will check for opposing team players in the 8 spaces around the
 * passed in player.
 * @param {WarGame.Players.Base} player - the attacker
 * @returns an array of opponent players in range of the attacker
 */
WarGame.Players.Base.prototype.getOpponentsInMeleRange = function () {
    var centre = this.location.clone();
    var opponents = [];
    for (var z=centre.z-1; z<=centre.z+1; z++) {
        if (z >= 0 && z < WarGame.Maps.getCurrent().getGrid().length) {
            for (var x=centre.x-1; x<=centre.x+1; x++) {
                if (x >= 0 && x < WarGame.Maps.getCurrent().getGrid()[z].length) {
                    var y = WarGame.Maps.getCurrent().getGrid()[z][x];
                    var nearPlayer = WarGame.Maps.getCurrent().locationOccupied(new WarGame.Players.Location(x, y, z));
                    if (nearPlayer && nearPlayer.team !== this.team) {
                        opponents.push(nearPlayer);
                    }
                }
            }
        }
    }

    return opponents;
};

/**
 * function will check for opposing team players within range of the passed in
 * player.stats.shoot value
 * @param {WarGame.Player} player - the attacker
 * @returns an array of opponent players in range of the attacker
 */
WarGame.Players.Base.prototype.getOpponentsInShootRange = function () {
    var loc = this.obj.position;
    var opponents = WarGame.getPlayers().filter(function (p) {
        return p.team !== this.team;
    });
    var filtered = [];
    for (var i=0; i<opponents.length; i++) {
        var oppLoc = opponents[i].obj.position;
        var dist = WarGame.Maps.getCurrent().getDistanceBetweenTwoPoints(loc, oppLoc);
        if (dist <= this.getShoot()) {
            // only allow shots at players not already engaged in battle
            if (!opponents[i].isBattling()) {
                filtered.push(opponents[i]);
            }
        }
    }

    return filtered;
};

WarGame.Players.Base.prototype.wound = function () {
    this.stats.wounds--;
    if (this.stats.wounds < 1) {
        // you are dead
        WarGame.onPlayerDefeated(this);
    }
};

WarGame.Players.Base.prototype.getCost = function () {
    return this.attributes.cost;
};

WarGame.Players.Base.prototype.getWounds = function () {
    return this.stats.wounds;
};

WarGame.Players.Base.prototype.getShoot = function () {
    return this.attributes.shoot;
};

WarGame.Players.Base.prototype.generateObj = function () {
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

    // move to current location
    this.moveTo(this.location, true);

    if (this.team && this.team.colour) {
        this.setColour(this.team.colour);
    }
};
