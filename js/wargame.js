var WarGame = WarGame || {};
WarGame.map = null;
WarGame.currentTeam = 0;
WarGame.MAX_BLOCK_HEIGHT = 5;
WarGame.STEP_OFFSET = 0.5;
WarGame.POINTS_PER_TEAM = 100;
WarGame.PRIORITY_PHASE = 0;
WarGame.MOVEMENT_PHASE = 1;
WarGame.SHOOTING_PHASE = 2;
WarGame.FIGHTING_PHASE = 3;
WarGame.CURRENT_PHASE = 0;
WarGame.TEAMS_DONE_PHASE = 0; // tracks number of teams who have completed current phase
WarGame.currentBattles = null;

WarGame.teams = [
    new WarGame.Team("RED", 0xff0000),
    new WarGame.Team("BLUE", 0x0044ff),
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
    var map = new WarGame.Map(m);
    WarGame.Plotter.scene.add(map.obj);
    WarGame.map = map;
};

WarGame.getTeamIndexByName = function (name) {
    for (var i=0; i<WarGame.teams.length; i++) {
        if (WarGame.teams[i].name.toLowerCase() === name.toLowerCase()) {
            return i;
        }
    }

    throw "unable to locate team with name: " + name;
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
    WarGame.teams[team].remainingPoints -= p.cost;
    var player = new WarGame.Player(WarGame.teams[team], p);
    player.boardLocation = startingLocation;
    WarGame.teams[team].addPlayer(player);
    WarGame.map.addPlayer(player, new THREE.Vector3(startingLocation.x, 0, startingLocation.z));
};

WarGame.removePlayer = function (player) {
    var team = WarGame.getTeamIndexByName(player.team.name);
    WarGame.teams[team].removePlayer(player);
    WarGame.map.removePlayer(player);
};

WarGame.doCurrentPhase = function () {
    switch (WarGame.CURRENT_PHASE) {
        case WarGame.PRIORITY_PHASE:
            WarGame.PriorityPhase.start();
            break;
        case WarGame.MOVEMENT_PHASE:
            WarGame.MovePhase.start();
            break;
        case WarGame.SHOOTING_PHASE:
            WarGame.ShootPhase.start();
            break;
        case WarGame.FIGHTING_PHASE:
            WarGame.FightPhase.start();
            break;
        default:
            // TODO: log this
            WarGame.CURRENT_PHASE = WarGame.PRIORITY_PHASE;
            WarGame.doCurrentPhase();
    }
};

WarGame.nextPhase = function () {
    // end phase
    WarGame.CURRENT_PHASE++;
    if (WarGame.CURRENT_PHASE > WarGame.FIGHTING_PHASE) {
        WarGame.CURRENT_PHASE = WarGame.PRIORITY_PHASE;
    }

    // start next phase
    WarGame.doCurrentPhase();
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
