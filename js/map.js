var WarGame = WarGame || {};
WarGame.Map = function (attributes) {
    this.obj = null;
    this.attributes = attributes;
    this.playerMap = new Array(this.attributes.grid.length);
    for (var z=0; z<this.attributes.grid.length; z++) {
        // TODO: handle irregular maps
        this.playerMap[z] = new Array(this.attributes.grid[z].length);
    }
    this.generateObj();
};

WarGame.Map.prototype.addPlayer = function (player, location) {
    this.movePlayerTo(player, location, false);
    WarGame.Plotter.scene.add(player.obj);
};

WarGame.Map.prototype.removePlayer = function (player) {
    WarGame.Plotter.scene.remove(player.obj);
    if (player.boardLocation) {
        this.playerMap[player.boardLocation.z][player.boardLocation.x] = null;
    }
};

WarGame.Map.prototype.getPlayers = function () {
    var players = [];
    for (var z=0; z<this.playerMap.length; z++) {
        for (var x=0; x<this.playerMap[z].length; x++) {
            if (this.playerMap[z][x]) {
                players.push(this.playerMap[z][x]);
            }
        }
    }

    return players;
};

WarGame.Map.prototype.movePlayerTo = function (player, location, restrict) {
    var limitDistance = true;
    if (restrict === false) {
        limitDistance = restrict;
    }
    var height = this.attributes.grid[location.z][location.x];
    location.y = height;
    var coordinates = WarGame.Utils.boardLocToCoordinates({ x: location.x, y: location.y, z: location.z }, this.attributes.grid);
    var dist = this.getDistanceBetweenTwoPoints(player.obj.position, coordinates);
    if (!limitDistance || player.attributes.move >= dist) {
        if (!this.locationOccupied(location)) {
            if (player.boardLocation) {
                this.playerMap[player.boardLocation.z][player.boardLocation.x] = null;
            }
            this.playerMap[location.z][location.x] = player;
            player.boardLocation = location;
            player.moveTo(coordinates);
        } else {
            alert("space is occupied, please choose another.");
        }
    } else {
        // TODO: alert and allow retry
        alert("distance too far. player can only move: " + player.attributes.move);
    }
};

WarGame.Map.prototype.getDistanceBetweenTwoPoints = function (p1, p2) {
    return new THREE.Line3(new THREE.Vector3().copy(p1), new THREE.Vector3().copy(p2)).distance();
};

WarGame.Map.prototype.locationOccupied = function (location) {
    try {
        if (this.playerMap[location.z][location.x]) {
            return this.playerMap[location.z][location.x];
        }
    } catch (e) {
        // TODO: invalid location so log it
    }
    return false;
};

/**
 * function will check for opposing team players in the 8 spaces around the
 * passed in player.
 * @param {WarGame.Player} player - the attacker
 * @returns an array of opponent players in range of the attacker
 */
WarGame.Map.prototype.getOpponentsInMeleRange = function (player) {
    var centre = player.boardLocation;
    var opponents = [];
    for (var z=centre.z-1; z<=centre.z+1; z++) {
        if (z > 0 && z <= this.playerMap.length) {
            for (var x=centre.x-1; x<=centre.x+1; x++) {
                if (x > 0 && x <= this.playerMap[z].length) {
                    var nearPlayer = this.locationOccupied(new THREE.Vector3(x, 0, z));
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
            filtered.push(opponents[i]);
        }
    }

    return filtered;
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
