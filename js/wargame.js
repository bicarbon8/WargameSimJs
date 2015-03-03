var WarGame = WarGame || {};
WarGame.map = null;
WarGame._players = [];

WarGame.initialize = function () {
    WarGame.Plotter.initialize();
};

WarGame.setMap = function(type) {
    WarGame.reset();
    var m;
    for (var i in WarGame.Maps) {
        var mp = WarGame.Maps[i];
        if (mp.name.toLowerCase() === type.toLowerCase()) {
            m = mp;
        }
    }
    if (!m) {
        throw "unable to locate map of type: " + type;
    }
    var map = new WarGame.Map(WarGame.MapObjGenerator.parse(m), m);
    WarGame.Plotter.scene.add(map.obj);
    WarGame.map = map;
};

WarGame.addPlayer = function (type, team, startingLocation) {
    // get player definition
    var p;
    for (var i in WarGame.Players) {
        var pl = WarGame.Players[i];
        if (pl.name.toLowerCase() === type.toLowerCase()) {
            p = pl;
        }
    }
    if (!p) {
        throw "unable to locate player of type: " + type;
    }
    var height = WarGame.map.attributes.grid[startingLocation.x][startingLocation.z];
    var player = new WarGame.Player(WarGame.PlayerObjGenerator.parse(p), team, p);
    var matrix = new THREE.Matrix4();
    var coordinates = WarGame.Utils.translateCoordinates({ x: startingLocation.x, y: height, z: startingLocation.z }, WarGame.map);
    matrix.makeTranslation(
        coordinates.x,
        coordinates.y,
        coordinates.z
    );
    player.obj.applyMatrix(matrix);
    WarGame._players.push(player);
    WarGame.Plotter.scene.add(player.obj);
};

WarGame.render = function () {
    WarGame.Plotter.render();
};

WarGame.reset = function () {
    // TODO:
};
