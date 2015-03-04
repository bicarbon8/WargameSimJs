var WarGame = WarGame || {};
WarGame.map = null;
WarGame.POINTS_PER_TEAM = 100;
WarGame.PRIORITY_PHASE = 0;
WarGame.MOVEMENT_PHASE = 1;
WarGame.SHOOTING_PHASE = 2;
WarGame.FIGHTING_PHASE = 3;
WarGame.CURRENT_PHASE = 0;

WarGame.teams = [
    { colour: 0xff0000, remainingPoints: WarGame.POINTS_PER_TEAM }, // red
    { colour: 0x0044ff, remainingPoints: WarGame.POINTS_PER_TEAM }, // blue
];

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
            if (WarGame.teams[team].remainingPoints - pl.cost >= 0) {
                p = pl;
            } else {
                throw "not enough points to add player. have: " +
                    WarGame.teams[team].remainingPoints + ", cost: " + pl.cost;
            }
        }
    }
    if (!p) {
        throw "unable to locate player of type: " + type;
    }
    var height = WarGame.map.attributes.grid[startingLocation.x][startingLocation.z];
    WarGame.teams[team].remainingPoints -= p.cost;
    var player = new WarGame.Player(WarGame.PlayerObjGenerator.parse(p), WarGame.teams[team], p);
    WarGame.map.addPlayer(player, new THREE.Vector3(startingLocation.x, height, startingLocation.z));
};

WarGame.endPhase = function () {
    WarGame.CURRENT_PHASE++;
    if (WarGame.CURRENT_PHASE > WarGame.FIGHTING_PHASE) {
        WarGame.CURRENT_PHASE = 0;
    }
};

WarGame.render = function () {
    WarGame.Plotter.render();
};

WarGame.reset = function () {
    WarGame.map = null;
    WarGame.CURRENT_PHASE = WarGame.PRIORITY_PHASE;
    if (WarGame.Plotter) {
        WarGame.Plotter.reset();
    }
    // TODO: reset ALL THE THINGS!
};
