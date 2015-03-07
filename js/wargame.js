var WarGame = WarGame || {};
WarGame.map = null;
WarGame.currentTeam = 0;
WarGame.POINTS_PER_TEAM = 100;
WarGame.PRIORITY_PHASE = 0;
WarGame.MOVEMENT_PHASE = 1;
WarGame.SHOOTING_PHASE = 2;
WarGame.FIGHTING_PHASE = 3;
WarGame.CURRENT_PHASE = 0;
WarGame.TEAMS_DONE_PHASE = 0; // tracks number of teams who have completed current phase

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
        var intersects = WarGame.Utils.getMouseIntersects(players.map(function (p) { return p.obj; }));
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
    var team = WarGame.teams[WarGame.currentTeam];
    var container = document.querySelector('#fightRow');
    container.innerHTML = '';
    // get all players for team
    if (team) {
        var players = team.players;
        var intersects = WarGame.Utils.getMouseIntersects(players.map(function (p) { return p.obj; }));
        if (intersects.length > 0) {
            for (var i=0; i<players.length; i++) {
                if (intersects[0].object === players[i].obj) {
                    var opponents = WarGame.map.getOpponentsInMeleRange(players[i]);
                    var html = '' +
'<div class="panel panel-default">' +
'<div class="panel-heading">' +
'<h5 class="panel-title">' + team.name + ' Player, Type: ' + players[i].attributes.name + '</h5>' +
'</div>' +
'<div class="panel-body">' +
'<div class="form-group form-horizontal">' +
'<table class="table table-bordered">' +
'<tbody>';
                    for (var z=0; z<opponents.length; z++) {
                        html += '<tr>';
                        for (var x=0; x<opponents[z].length; x++) {
                            html += '<td>';
                            var opponent = opponents[z][x];
                            if (opponent) {
                                html += '' +
                                '<div class="radio">' +
                                '<label>' +
                                '<input type="radio" name="optionsRadios" value="' + opponent.boardLocation.x + '-' + opponent.boardLocation.z + '">' +
                                opponent.attributes.name +
                                '</label>' +
                                '</div>';
                            } else {
                                html += '' +
                                '<div class="radio disabled">' +
                                '<label>' +
                                '<input type="radio" name="optionsRadios" value="opponent" disabled>' +
                                'none' +
                                '</label>' +
                                '</div>';
                            }
                            html += '</td>';
                        }
                        html += '</tr>';
                    }
                    html += '' +
'</tbody>' +
'</table>' +
'<button type="submit" onclick="WarGame.fightPlayer(\'' + team.name + '\',' + i + ');" class="btn btn-default">Fight</button>' +
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

WarGame.doFightPhase = function () {
    var battles = WarGame.map.getBattleGroups(WarGame.teams[WarGame.currentTeam]);
    // TODO: let priority player choose battle order
    for (var i=0; i<battles.length; i++) {
        var battle = battles[i];
        battle.start();
    }
};

WarGame.doCurrentPhase = function () {
    var elem = document.querySelector('#currentPhase');
    switch (WarGame.CURRENT_PHASE) {
        case WarGame.PRIORITY_PHASE:
            elem.innerHTML = 'PRIORITY';
            WarGame.Plotter.renderer.domElement.removeEventListener('click', WarGame.handleFightClick, false);
            WarGame.doPriorityPhase();
            break;
        case WarGame.MOVEMENT_PHASE:
            elem.innerHTML = 'MOVEMENT';
            WarGame.Plotter.renderer.domElement.addEventListener('click', WarGame.handleMoveClick, false);
            break;
        case WarGame.SHOOTING_PHASE:
            WarGame.Plotter.renderer.domElement.removeEventListener('click', WarGame.handleMoveClick, false);
            WarGame.nextPhase();
            break; // TODO: implement
        case WarGame.FIGHTING_PHASE:
            elem.innerHTML = 'FIGHTING';
            // WarGame.Plotter.renderer.domElement.addEventListener('click', WarGame.handleFightClick, false);
            WarGame.doFightPhase();
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
            WarGame.TEAMS_DONE_PHASE = 0;
            WarGame.nextPhase();
        } else {
            WarGame.doCurrentPhase();
        }
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
