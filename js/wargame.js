var WarGame = WarGame || {};
WarGame.map = null;
WarGame.currentTeam = 0;
WarGame.INTERSECTED = null;
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
    var map = new WarGame.Map(WarGame.MapObjGenerator.parse(m), m);
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
    var player = new WarGame.Player(WarGame.PlayerObjGenerator.parse(p), WarGame.teams[team], p);
    player.boardLocation = startingLocation;
    WarGame.teams[team].addPlayer(player);
    WarGame.map.addPlayer(player, new THREE.Vector3(startingLocation.x, 0, startingLocation.z));
};

WarGame.removePlayer = function (player) {
    var i = WarGame.getTeamIndexByName(player.team.name);
    WarGame.teams[i].removePlayer(player);
    WarGame.map.removePlayer(player);
};

WarGame.handleMoveClick = function (event) {
    event.preventDefault();
    var team = WarGame.teams[WarGame.currentTeam];
    var container = document.querySelector('#moveRow');
    container.innerHTML = '';
    // get all players for team
    if (team) {
        var players = team.players;
        var intersects = WarGame.Utils.getMouseIntersects(event, players.map(function (p) { return p.obj; }));
        if (intersects.length > 0) {
            for (var i=0; i<players.length; i++) {
                if (intersects[0].object === players[i].obj) {
                    var html = '' +
'<div class="panel panel-default">' +
'<div class="panel-heading">' +
'<h5 class="panel-title">' + team.name + ' Player, Type: ' + players[i].attributes.name + '</h5>' +
'</div>' +
'<div class="panel-body">' +
'<div class="form-group form-horizontal">' +
'<label for="horizontalLocation">Horizontal Location: ' + "(1-" + WarGame.map.attributes.grid[0].length + ")" + '</label>' +
'<input id="x" type="text" value="' + players[i].boardLocation.x + '">' +
'<label for="verticalLocation">Vertical Location: ' + "(1-" + WarGame.map.attributes.grid.length + ")" + '</label>' +
'<input id="z" type="text" value="' + players[i].boardLocation.z + '">' +
'<button type="submit" onclick="WarGame.movePlayer(\'' + team.name + '\',' + i + ');" class="btn btn-default">Move</button>' +
'</div>' +
'</div>' +
'</div>';
                    container.innerHTML = html;
                    break;
                }
            }
        }
    }
};

WarGame.handleFightClick = function (event) {
    event.preventDefault();
    var intersects = WarGame.Utils.getMouseIntersects(event, WarGame.map.getPlayers().map(function (p) {
        return p.obj;
    }));

    var i;
    if (intersects.length > 0) {
        // get battle group
        var started = false;
        for (i=0; i<WarGame.currentBattles.length; i++) {
            var players = WarGame.currentBattles[i].getPlayers();
            for (var j=0; j<players.length; j++) {
                if (players[j].obj === intersects[0].object) {
                    started = true;
                    var b = WarGame.currentBattles[i];
                    WarGame.currentBattles.splice(i, 1); // remove this battle
                    b.start();
                    break;
                }
            }
        }

        // end phase if no more battles exist
        if (WarGame.currentBattles.length < 1) {
            WarGame.endPhase();
        }
    }
};

WarGame.handleMoveMouseMove = function (event) {
    event.preventDefault();
    var intersects = WarGame.Utils.getMouseIntersects(event, WarGame.teams[WarGame.currentTeam].players.map(function (p) {
        return p.obj;
    }));

    if (WarGame.INTERSECTED) {
        WarGame.INTERSECTED.material.emissive.setHex(WarGame.INTERSECTED.currentHex);
        WarGame.INTERSECTED = null;
    }
    if (intersects.length > 0) {
        WarGame.INTERSECTED = intersects[0].object;
        WarGame.INTERSECTED.currentHex = WarGame.INTERSECTED.material.emissive.getHex();
        WarGame.INTERSECTED.material.emissive.setHex(0xff0000);
    }
};

WarGame.handleFightMouseMove = function (event) {
    event.preventDefault();
    var intersects = WarGame.Utils.getMouseIntersects(event, WarGame.map.getPlayers().map(function (p) {
        return p.obj;
    }));

    if (WarGame.INTERSECTED && WarGame.INTERSECTED.length > 0) {
        for (i=0; i<WarGame.INTERSECTED.length; i++) {
            WarGame.INTERSECTED[i].obj.material.emissive.setHex(WarGame.INTERSECTED.currentHex);
        }
        WarGame.INTERSECTED = null;
    }

    var i;
    if (intersects.length > 0) {
        // get battle group
        for (i=0; i<WarGame.currentBattles.length; i++) {
            var players = WarGame.currentBattles[i].getPlayers();
            for (var j=0; j<players.length; j++) {
                if (players[j].obj === intersects[0].object) {
                    WarGame.INTERSECTED = players;
                    break;
                }
            }
            if (WarGame.INTERSECTED) {
                break;
            }
        }

        if (WarGame.INTERSECTED && WarGame.INTERSECTED.length > 0) {
            for (i=0; i<WarGame.INTERSECTED.length; i++) {
                WarGame.INTERSECTED[i].obj.currentHex = WarGame.INTERSECTED[i].obj.material.emissive.getHex();
                WarGame.INTERSECTED[i].obj.material.emissive.setHex(0xff0000);
            }
        }
    }
};

WarGame.doCurrentPhase = function () {
    var elem = document.querySelector('#currentPhase');
    switch (WarGame.CURRENT_PHASE) {
        case WarGame.PRIORITY_PHASE:
            elem.innerHTML = 'PRIORITY';
            WarGame.Plotter.renderer.domElement.removeEventListener('mousemove', WarGame.handleFightMouseMove, false);
            WarGame.Plotter.renderer.domElement.removeEventListener('click', WarGame.handleFightClick, false);
            WarGame.doPriorityPhase();
            break;
        case WarGame.MOVEMENT_PHASE:
            elem.innerHTML = 'MOVEMENT';
            WarGame.Plotter.renderer.domElement.addEventListener('mousemove', WarGame.handleMoveMouseMove, false);
            WarGame.Plotter.renderer.domElement.addEventListener('click', WarGame.handleMoveClick, false);
            break;
        case WarGame.SHOOTING_PHASE:
            WarGame.Plotter.renderer.domElement.removeEventListener('mousemove', WarGame.handleMoveMouseMove, false);
            WarGame.Plotter.renderer.domElement.removeEventListener('click', WarGame.handleMoveClick, false);
            WarGame.nextPhase();
            break; // TODO: implement
        case WarGame.FIGHTING_PHASE:
            elem.innerHTML = 'FIGHTING';
            WarGame.currentBattles = WarGame.map.getBattleGroups(WarGame.teams[WarGame.currentTeam]);
            WarGame.Plotter.renderer.domElement.addEventListener('mousemove', WarGame.handleFightMouseMove, false);
            WarGame.Plotter.renderer.domElement.addEventListener('click', WarGame.handleFightClick, false);
            break;
        default:
            WarGame.CURRENT_PHASE = WarGame.MOVEMENT_PHASE;
            WarGame.doCurrentPhase();
    }
};

WarGame.endPhase = function () {
    if (WarGame.CURRENT_PHASE === WarGame.FIGHTING_PHASE) {
        WarGame.nextPhase();
    } else {
        WarGame.TEAMS_DONE_PHASE++;

        // TODO: handle more than 2 teams
        if (WarGame.currentTeam === 0) {
            WarGame.currentTeam = 1;
        } else {
            WarGame.currentTeam = 0;
        }
        var elem = document.querySelector('#priorityTeam');
        elem.innerHTML = WarGame.teams[WarGame.currentTeam].name;

        if (WarGame.TEAMS_DONE_PHASE >= WarGame.teams.length) {
            WarGame.nextPhase();
        } else {
            WarGame.doCurrentPhase();
        }
    }
};

WarGame.nextPhase = function () {
    // end phase
    WarGame.TEAMS_DONE_PHASE = 0;
    WarGame.CURRENT_PHASE++;
    if (WarGame.CURRENT_PHASE > WarGame.FIGHTING_PHASE) {
        WarGame.CURRENT_PHASE = WarGame.PRIORITY_PHASE;
    }

    // start next phase
    WarGame.doCurrentPhase();
};

WarGame.doPriorityPhase = function () {
    // roll dice for each team
    var elem = document.querySelector('#priorityTeam');
    var team;
    // TODO: handle more than two teams
    var one = WarGame.Utils.diceRoll()[0];
    var two = WarGame.Utils.diceRoll()[0];
    if (one === two) {
        WarGame.doPriorityPhase();
    }
    if (one > two) {
        WarGame.currentTeam = 0;
    } else {
        WarGame.currentTeam = 1;
    }
    elem.innerHTML = WarGame.teams[WarGame.currentTeam].name;

    // move to next phase
    WarGame.nextPhase();
};

WarGame.movePlayer = function (teamName, index) {
    var team = WarGame.teams[WarGame.getTeamIndexByName(teamName)];
    var container = document.querySelector('#moveRow');
    // get all players for team
    if (team) {
        var players = team.players;
        var x = document.querySelector('#x').value;
        var z = document.querySelector('#z').value;
        // TODO: handle OOB errors
        container.innerHTML = '';
        WarGame.map.movePlayerTo(players[index], new THREE.Vector3(parseInt(x), 0, parseInt(z)));
    }
};

WarGame.fightPlayer = function (teamName, index) {
    var team = WarGame.teams[WarGame.getTeamIndexByName(teamName)];
    var container = document.querySelector('#fightRow');
    // get all players for team
    if (team) {
        var players = team.players;
        var location = $('input:radio:checked').val().split('-');
        var x = parseInt(location[0]);
        var z = parseInt(location[1]);
        // TODO: handle OOB errors
        container.innerHTML = '';
        var opponent = WarGame.map.playerMap[z][x];
        players[index].battle(opponent);
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
