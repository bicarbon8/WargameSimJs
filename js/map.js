var WarGame = WarGame || {};
WarGame.Map = function (obj, attributes) {
    this.obj = obj;
    this.attributes = attributes;
    this.playerMap = new Array(this.attributes.grid.length);
    for (var z=0; z<this.attributes.grid.length; z++) {
        // TODO: handle irregular maps
        this.playerMap[z] = new Array(this.attributes.grid[z].length);
    }
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
    if ((!limitDistance || player.attributes.stats.move >= dist) && !this.locationOccupied(location)) {
        if (player.boardLocation) {
            this.playerMap[player.boardLocation.z][player.boardLocation.x] = null;
        }
        this.playerMap[location.z][location.x] = player;
        player.boardLocation = location;
        player.moveTo(coordinates);
    } else {
        // TODO: alert and allow retry
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
    var opponents = [
        [null,null,null],
        [null,null,null],
        [null,null,null]
    ];
    var i=0;
    for (var z=centre.z-1; z<=centre.z+1; z++) {
        var j=0;
        if (z > 0 && z <= this.playerMap.length) {
            for (var x=centre.x-1; x<=centre.x+1; x++) {
                if (x > 0 && x <= this.playerMap[z].length) {
                    var nearPlayer = this.locationOccupied(new THREE.Vector3(x, 0, z));
                    if (nearPlayer && nearPlayer.team.name !== player.team.name) {
                        opponents[i][j] = nearPlayer;
                    }
                }
                j++;
            }
        }
        i++;
    }

    return opponents;
};
