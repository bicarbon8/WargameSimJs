var WarGame = WarGame || {};
WarGame.MovePhase = {
    TEAMS_DONE_PHASE: 0,

    start: function () {
        document.querySelector('#currentPhase').innerHTML = 'MOVEMENT';

        var players = WarGame.map.getPlayers();
        for (var i=0; i<players.length; i++) {
            players[i].history[WarGame.CURRENT_ROUND].move.loc = players[i].obj.position;
            players[i].history[WarGame.CURRENT_ROUND].move.boardLoc = players[i].boardLocation;
        }

        WarGame.Plotter.renderer.domElement.addEventListener('mousemove', WarGame.MovePhase.handleMoveMouseMove, false);
        WarGame.Plotter.renderer.domElement.addEventListener('click', WarGame.MovePhase.handleMoveClick, false);
        document.querySelector('#moveRow').innerHTML = '' +
'<button type="submit" onclick="WarGame.MovePhase.endTurn();" class="btn btn-default">End Turn</button>';
    },

    endTurn: function () {
        document.querySelector('#moveRow').innerHTML = '' +
'<button type="submit" onclick="WarGame.MovePhase.endTurn();" class="btn btn-default">End Turn</button>';
        WarGame.MovePhase.TEAMS_DONE_PHASE++;

        WarGame.nextTeam();

        if (WarGame.MovePhase.TEAMS_DONE_PHASE >= WarGame.teams.length) {
            WarGame.MovePhase.TEAMS_DONE_PHASE = 0;
            WarGame.MovePhase.end();
        }
    },

    end: function () {
        document.querySelector('#moveRow').innerHTML = '';
        WarGame.Plotter.renderer.domElement.removeEventListener('mousemove', WarGame.MovePhase.handleMoveMouseMove, false);
        WarGame.Plotter.renderer.domElement.removeEventListener('click', WarGame.MovePhase.handleMoveClick, false);
        // move to next phase
        WarGame.nextPhase();
    },

    movePlayer: function (teamName, playerId) {
        var team = WarGame.teams[WarGame.getTeamIndexByName(teamName)];
        var container = document.querySelector('#moveRow');
        // get all players for team
        if (team) {
            var players = team.players.filter(function (p) {
                return p.id === playerId;
            });
            var x = document.querySelector('#x').value;
            var z = document.querySelector('#z').value;
            // TODO: handle OOB errors
            WarGame.map.movePlayerTo(players[0], new THREE.Vector3(parseInt(x), 0, parseInt(z)));
        }
    },

    handleMoveMouseMove: function (event) {
        event.preventDefault();

        var players = WarGame.teams[WarGame.CURRENT_TEAM].players.filter(function (p) {
            return !p.isBattling();
        });
        var intersects = WarGame.Utils.getMouseIntersects(event, players.map(function (p) {
            return p.obj;
        }));

        if (WarGame.MovePhase.INTERSECTED) {
            WarGame.MovePhase.INTERSECTED.material.emissive.setHex(WarGame.MovePhase.INTERSECTED.currentHex);
            WarGame.MovePhase.INTERSECTED = null;
        }
        if (intersects.length > 0) {
            WarGame.MovePhase.INTERSECTED = intersects[0].object;
            WarGame.MovePhase.INTERSECTED.currentHex = WarGame.MovePhase.INTERSECTED.material.emissive.getHex();
            WarGame.MovePhase.INTERSECTED.material.emissive.setHex(0xff0000);
        }
    },

    handleMoveClick: function (event) {
        event.preventDefault();
        var team = WarGame.teams[WarGame.CURRENT_TEAM];
        // get all players for team
        if (team) {
            var players = team.players.filter(function (p) {
                return !p.isBattling();
            });
            var intersects = WarGame.Utils.getMouseIntersects(event, players.map(function (p) { return p.obj; }));
            if (intersects.length > 0) {
                for (var i=0; i<players.length; i++) {
                    if (intersects[0].object === players[i].obj) {
                        var container = document.querySelector('#moveRow');
                        container.innerHTML = '';
                        var html = '' +
'<div class="panel panel-default">' +
'<div class="panel-heading">' +
'<h5 class="panel-title">' + team.name + ' Player, Type: ' + players[i].attributes.name + '</h5>' +
'<br>' + players[i].stats.toString() +
'</div>' +
'<div class="panel-body">' +
'<div class="form-group form-horizontal">' +
'<label for="horizontalLocation">Horizontal Location: ' + "(1-" + WarGame.map.attributes.grid[0].length + ")" + '</label>' +
'<input id="x" type="text" value="' + players[i].boardLocation.x + '">' +
'<label for="verticalLocation">Vertical Location: ' + "(1-" + WarGame.map.attributes.grid.length + ")" + '</label>' +
'<input id="z" type="text" value="' + players[i].boardLocation.z + '">' +
'<button type="submit" onclick="WarGame.MovePhase.movePlayer(\'' + team.name + '\',' + players[i].id + ');" class="btn btn-default">Move</button>' +
'</div>' +
'</div>' +
'</div>' +
'<button type="submit" onclick="WarGame.MovePhase.endTurn();" class="btn btn-default">End Turn</button>';
                        container.innerHTML = html;
                        break;
                    }
                }
            }
        }
    },
};
