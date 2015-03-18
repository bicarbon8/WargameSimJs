var WarGame = WarGame || {};
WarGame.Players = WarGame.Players || {};
WarGame.Players.Location = function(x, y, z, grid) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.grid = grid;
    if (!grid) {
        this.grid = WarGame.Maps.getCurrent().getGrid();
    }
};

WarGame.Players.Location.prototype.setFromVector = function (vector) {
    var zLength = this.grid.length;
    var xLength = this.grid[0].length;
    var actualX = vector.x;
    var actualY = vector.y;
    var actualZ = vector.z;
    var boardX = (xLength / 2) + actualX;
    var boardY = actualY / WarGame.STEP_OFFSET;
    var boardZ = (zLength / 2) + actualZ;

    this.x = boardX;
    this.y = boardY;
    this.z = boardZ;
};

WarGame.Players.Location.prototype.toVector = function () {
    var zLength = this.grid.length;
    var xLength = this.grid[0].length;
    var boardX = this.x;
    var boardZ = this.z;
    var boardY = this.y;
    var actualX = -(xLength / 2) + boardX;
    var actualZ = -(zLength / 2) + boardZ;
    var actualY = (boardY * WarGame.STEP_OFFSET);

    return new THREE.Vector3(actualX, actualY, actualZ);
};

WarGame.Players.Location.prototype.clone = function () {
    return new WarGame.Players.Location(this.x, this.y, this.z);
};

WarGame.Players.Location.prototype.equals = function (location) {
    if (this.x === location.x &&
        this.y === location.y &&
        this.z === location.z) {
        return true;
    } else {
        return false;
    }
};

WarGame.Players.Location.prototype.toString = function () {
    return this.x + ':' + this.y + ':' + this.z;
};
