var WarGame = WarGame || {};
WarGame.Maps = WarGame.Maps || {};
WarGame.Maps.Base = function (attributes) {
    this.obj = null;
    this.attributes = attributes;
    this.players = {};
};

WarGame.Maps.Base.prototype.getObj = function () {
    if (!this.obj) {
        this.generateObj();
    }
    return this.obj;
};

WarGame.Maps.Base.prototype.getGrid = function () {
    return this.attributes.grid;
};

WarGame.Maps.Base.prototype.addPlayer = function (player, location) {
    if (!this.hasPlayer(player)) {
        this.players[player.location.toString()] = player;
        this.movePlayerTo(player, location, true);
        WarGame.UI.addMesh(player.obj);
    }
};

WarGame.Maps.Base.prototype.removePlayer = function (player) {
    var pl = this.players[player.location.toString()];
    if (pl === player) {
        this.players[player.location.toString()] = null;
        WarGame.UI.removeMesh(player.obj);
    } else {
        // TODO: log no such player
    }
};

WarGame.Maps.Base.prototype.getPlayers = function () {
    var players = [];
    for (var i in this.players) {
        var p = this.players[i];
        if (p && p instanceof WarGame.Players.Base) {
            players.push(p);
        }
    }
    return players;
};

WarGame.Maps.Base.prototype.movePlayerTo = function (player, location, overrideLimit) {
    var height = this.attributes.grid[location.z][location.x];
    location.y = height;
    if (!this.locationOccupied(location)) {
        try {
            this.players[player.location.toString()] = null;
            this.players[location.toString()] = player;
            player.moveTo(location, overrideLimit);
        } catch (e) {
            // alert and rollback changes
            this.players[location.toString()] = null;
            this.players[player.history[WarGame.CURRENT_ROUND].move.boardLoc.toString()] = player;
            WarGame.UI.displayAlert(e);
        }
    } else {
        WarGame.UI.displayAlert("space is occupied, please choose another.");
    }
};

WarGame.Maps.Base.prototype.getDistanceBetweenTwoPoints = function (p1, p2) {
    // TODO: calculate in terms of board spaces, not actual distance
    return new THREE.Line3(new THREE.Vector3().copy(p1), new THREE.Vector3().copy(p2)).distance();
};

WarGame.Maps.Base.prototype.locationOccupied = function (location) {
    return this.players[location.toString()];
};

WarGame.Maps.Base.prototype.hasPlayer = function (player) {
    var found = false;
    var players = this.getPlayers();
    for (var i=0; i<players.length; i++) {
        if (this.players[i] === player) {
            found = true;
            break;
        }
    }
    return found;
};

WarGame.Maps.Base.prototype.generateObj = function () {
    var mapGeometry = new THREE.Geometry();
    var matrix = new THREE.Matrix4();

    for (var z=0; z<this.attributes.grid.length; z++) {
        for (var x=0; x<this.attributes.grid[z].length; x++) {
            var boxGeometry = new THREE.BoxGeometry(1, WarGame.Maps.MAX_BLOCK_HEIGHT, 1);
            var y = -(WarGame.Maps.MAX_BLOCK_HEIGHT) + this.attributes.grid[z][x];
            var coordinates = new WarGame.Players.Location(x, y, z, this.attributes.grid).toVector();
            matrix.makeTranslation(
                coordinates.x,
                coordinates.y,
                coordinates.z
            );
            mapGeometry.merge(boxGeometry, matrix);
        }
    }

    var mapMaterial = new THREE.MeshLambertMaterial({
        color: 0x44ff44,
        // wireframe: true
    });
    var mapObj = new THREE.Mesh(mapGeometry, mapMaterial);
    mapObj.receiveShadow = true;
    mapObj.castShadow = true;

    this.obj = mapObj;
};
