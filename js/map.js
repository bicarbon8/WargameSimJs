var WarGame = WarGame || {};
WarGame.Map = function (attributes) {
    this.obj = null;
    this.attributes = attributes;
    this.players = {};
};

WarGame.Map.prototype.getObj = function () {
    if (!this.obj) {
        this.generateObj();
    }
    return this.obj;
};

WarGame.Map.prototype.getGrid = function () {
    return this.attributes.grid;
};

WarGame.Map.prototype.addPlayer = function (player, location) {
    if (!this.hasPlayer(player)) {
        this.players[player.boardLocation.toString()] = player;
        this.movePlayerTo(player, location, true);
        WarGame.Plotter.addMesh(player.obj);
    }
};

WarGame.Map.prototype.removePlayer = function (player) {
    var pl = this.players[player.boardLocation.toString()];
    if (pl === player) {
        this.players[player.boardLocation.toString()] = null;
        WarGame.Plotter.removeMesh(player.obj);
    } else {
        // TODO: log no such player
    }
};

WarGame.Map.prototype.getPlayers = function () {
    var players = [];
    for (var i in this.players) {
        var p = this.players[i];
        if (p && p instanceof WarGame.Player) {
            players.push(p);
        }
    }
    return players;
};

WarGame.Map.prototype.movePlayerTo = function (player, location, overrideLimit) {
    var height = this.attributes.grid[location.z][location.x];
    location.y = height;
    if (!this.locationOccupied(location)) {
        try {
            var coordinates = location.toVector();
            this.players[player.boardLocation.toString()] = null;
            this.players[location.toString()] = player;
            player.moveTo(coordinates, overrideLimit);
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

WarGame.Map.prototype.getDistanceBetweenTwoPoints = function (p1, p2) {
    // TODO: calculate in terms of board spaces, not actual distance
    return new THREE.Line3(new THREE.Vector3().copy(p1), new THREE.Vector3().copy(p2)).distance();
};

WarGame.Map.prototype.locationOccupied = function (location) {
    return this.players[location.toString()];
};

/**
 * function will check for opposing team players in the 8 spaces around the
 * passed in player.
 * @param {WarGame.Player} player - the attacker
 * @returns an array of opponent players in range of the attacker
 */
WarGame.Map.prototype.getOpponentsInMeleRange = function (player) {
    var centre = player.boardLocation.clone();
    var opponents = [];
    for (var z=centre.z-1; z<=centre.z+1; z++) {
        if (z >= 0 && z < this.attributes.grid.length) {
            for (var x=centre.x-1; x<=centre.x+1; x++) {
                if (x >= 0 && x < this.attributes.grid[z].length) {
                    var y = this.attributes.grid[z][x];
                    var nearPlayer = this.locationOccupied(new WarGame.BoardLocation(x, y, z));
                    if (nearPlayer && nearPlayer.team.name !== player.team.name) {
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
WarGame.Map.prototype.getOpponentsInShootRange = function (player) {
    var loc = player.obj.position;
    var opponents = this.getPlayers().filter(function (p) {
        return p.team !== player.team;
    });
    var filtered = [];
    for (var i=0; i<opponents.length; i++) {
        var oppLoc = opponents[i].obj.position;
        var dist = this.getDistanceBetweenTwoPoints(loc, oppLoc);
        if (dist <= player.attributes.shoot) {
            // only allow shots at players not already engaged in battle
            if (!opponents[i].isBattling()) {
                filtered.push(opponents[i]);
            }
        }
    }

    return filtered;
};

WarGame.Map.prototype.hasPlayer = function (player) {
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

WarGame.Map.prototype.generateObj = function () {
    var mapGeometry = new THREE.Geometry();
    var matrix = new THREE.Matrix4();

    for (var z=0; z<this.attributes.grid.length; z++) {
        for (var x=0; x<this.attributes.grid[z].length; x++) {
            var boxGeometry = new THREE.BoxGeometry(1, WarGame.MAX_BLOCK_HEIGHT, 1);
            var y = -(WarGame.MAX_BLOCK_HEIGHT) + this.attributes.grid[z][x];
            var coordinates = WarGame.Utils.boardLocToCoordinates(new THREE.Vector3(x,y,z), this.attributes.grid);
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
