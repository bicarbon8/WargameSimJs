var WarGame = WarGame || {};
WarGame.map = null;
WarGame.CURRENT_TEAM = 0;
WarGame.CURRENT_ROUND = 0;
WarGame.CURRENT_PHASE = 0;
WarGame.PRIORITY_TEAM = 0;
WarGame.MAX_BLOCK_HEIGHT = 5;
WarGame.STEP_OFFSET = 0.5;
WarGame.POINTS_PER_TEAM = 100;
WarGame.PRIORITY_PHASE = 0;
WarGame.MOVEMENT_PHASE = 1;
WarGame.SHOOTING_PHASE = 2;
WarGame.FIGHTING_PHASE = 3;
WarGame.TEAMS_DONE_PHASE = 0; // tracks number of teams who have completed current phase
WarGame.currentBattles = null;

WarGame.teams = [
    new WarGame.Team("RED", 0xff0000),
    new WarGame.Team("BLUE", 0x0044ff),
];

WarGame.initialize = function () {
    WarGame.Plotter.initialize();
    WarGame.UI.initialize();
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
    WarGame.Plotter.scene.add(map.getObj());
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
                WarGame.UI.displayAlert("not enough points to add player. have: " +
                    WarGame.teams[team].remainingPoints + ", cost: " + pl.cost);
            }
        }
    }
    if (!p) {
        throw "unable to locate player of type: " + type;
    }
    WarGame.teams[team].remainingPoints -= p.cost;
    var player = new WarGame.Player(WarGame.teams[team], p);
    WarGame.teams[team].addPlayer(player);
    WarGame.map.addPlayer(player, new WarGame.BoardLocation(startingLocation.x, 0, startingLocation.z));
};

WarGame.removePlayer = function (player) {
    var team = WarGame.getTeamIndexByName(player.team.name);
    WarGame.teams[team].removePlayer(player);
    WarGame.map.removePlayer(player);
};

WarGame.getCurrentPhaseName = function () {
    switch (WarGame.CURRENT_PHASE) {
        case WarGame.PRIORITY_PHASE:
            return 'PRIORITY';
        case WarGame.MOVEMENT_PHASE:
            return 'MOVEMENT';
        case WarGame.SHOOTING_PHASE:
            return 'SHOOTING';
        case WarGame.FIGHTING_PHASE:
            return 'FIGHTING';
    }
};

WarGame.doCurrentPhase = function () {
    WarGame.CURRENT_TEAM = WarGame.PRIORITY_TEAM;

    WarGame.UI.setCurrentTeamText(WarGame.teams[WarGame.CURRENT_TEAM].name);

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
        WarGame.CURRENT_ROUND++;
        // add history record for new round for all players
        var players = WarGame.map.getPlayers();
        for (var i=0; i<players.length; i++) {
            players[i].history.push(new WarGame.History());
        }
    }

    // start next phase
    WarGame.doCurrentPhase();
};

WarGame.nextTeam = function () {
    // TODO: handle more than 2 teams
    if (WarGame.CURRENT_TEAM === 0) {
        WarGame.CURRENT_TEAM = 1;
    } else {
        WarGame.CURRENT_TEAM = 0;
    }
    WarGame.UI.setCurrentTeamText(WarGame.teams[WarGame.CURRENT_TEAM].name);
};

WarGame.render = function () {
    WarGame.Plotter.render();
    WarGame.UI.update();
};

WarGame.reset = function () {
    WarGame.map = null;
    WarGame.CURRENT_PHASE = WarGame.PRIORITY_PHASE;
    WarGame.teams = [
        new WarGame.Team("RED", 0xff0000),
        new WarGame.Team("BLUE", 0x0044ff),
    ];
    if (WarGame.Plotter) {
        WarGame.Plotter.reset();
    }
    // TODO: reset ALL THE THINGS!
};

WarGame.onPlayerDefeated = function (player) {
    WarGame.UI.displayDefeatedAlert(player);
    WarGame.removePlayer(player);
};
