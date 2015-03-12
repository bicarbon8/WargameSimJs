var WarGame = WarGame || {};
WarGame.BoardLocation = function(x, y, z, grid) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.grid = grid;
    if (!grid) {
        this.grid = WarGame.map.attributes.grid;
    }
};

WarGame.BoardLocation.prototype.setFromVector = function (vector) {
    var grid = this.grid;
    var zLength = grid.length;
    var xLength = grid[0].length;
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

WarGame.BoardLocation.prototype.toVector = function () {
    var grid = this.grid;
    var zLength = grid.length;
    var xLength = grid[0].length;
    var boardX = this.x;
    var boardZ = this.z;
    var boardY = this.y;
    var actualX = -(xLength / 2) + boardX;
    var actualZ = -(zLength / 2) + boardZ;
    var actualY = (boardY * WarGame.STEP_OFFSET);

    return new THREE.Vector3(actualX, actualY, actualZ);
};

WarGame.BoardLocation.prototype.clone = function () {
    return new WarGame.BoardLocation(this.x, this.y, this.z);
};

WarGame.BoardLocation.prototype.equals = function (boardLocation) {
    if (this.x === boardLocation.x &&
        this.y === boardLocation.y &&
        this.z === boardLocation.z) {
        return true;
    } else {
        return false;
    }
};

WarGame.BoardLocation.prototype.toString = function () {
    return this.x + '-' + this.y + '-' + this.z;
};
