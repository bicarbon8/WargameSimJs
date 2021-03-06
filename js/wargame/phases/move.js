var WarGame = WarGame || {};
WarGame.Phases = WarGame.Phases || {};
WarGame.Phases.Move = {
    TEAMS_DONE_PHASE: 0,

    start: function () {
        var players = WarGame.getPlayers();
        for (var i=0; i<players.length; i++) {
            players[i].history[WarGame.Rounds.getCurrent()].move.loc = new THREE.Vector3().copy(players[i].obj.position);
            players[i].history[WarGame.Rounds.getCurrent()].move.boardLoc = players[i].location.clone();
        }

        WarGame.UI.Plotter.addListener('mousemove', WarGame.Phases.Move.handleMoveMouseMove);
        WarGame.UI.Plotter.addListener('click', WarGame.Phases.Move.handleMoveClick);
        WarGame.UI.setContents('moveRow', '<button type="submit" onclick="WarGame.Phases.Move.endTurn();" class="btn btn-default">End Turn</button>');
    },

    endTurn: function () {
        WarGame.Phases.Move.TEAMS_DONE_PHASE++;

        if (WarGame.Phases.Move.TEAMS_DONE_PHASE >= WarGame.Teams.get().length) {
            WarGame.Phases.Move.TEAMS_DONE_PHASE = 0;
            WarGame.Phases.Move.end();
        } else {
            WarGame.Teams.next();
            WarGame.UI.setContents('moveRow', '<button type="submit" onclick="WarGame.Phases.Move.endTurn();" class="btn btn-default">End Turn</button>');
        }
    },

    end: function () {
        WarGame.UI.setContents('moveRow', '');
        WarGame.UI.Plotter.removeListener('mousemove', WarGame.Phases.Move.handleMoveMouseMove);
        WarGame.UI.Plotter.removeListener('click', WarGame.Phases.Move.handleMoveClick);
        // move to next phase
        WarGame.Phases.next();
    },

    movePlayer: function (teamName, playerId) {
        var team = WarGame.Teams.getTeamByName(teamName);
        // get all players for team
        if (team) {
            var players = team.players.filter(function (p) {
                return p.id === playerId;
            });
            var x = WarGame.UI.getValue('x');
            var z = WarGame.UI.getValue('z');
            // TODO: handle OOB errors
            WarGame.Maps.getCurrent().movePlayerTo(players[0], new WarGame.Players.Location(parseInt(x), 0, parseInt(z)));
        }
    },

    handleMoveMouseMove: function (event) {
        event.preventDefault();

        var players = WarGame.Teams.getCurrent().getPlayers().filter(function (p) {
            return !p.isBattling();
        });
        var intersects = WarGame.Utils.getMouseIntersects(event, players.map(function (p) {
            return p.obj;
        }));

        if (WarGame.Phases.Move.INTERSECTED) {
            WarGame.Phases.Move.INTERSECTED.material.emissive.setHex(WarGame.Phases.Move.INTERSECTED.currentHex);
            WarGame.Phases.Move.INTERSECTED = null;
        }
        if (intersects.length > 0) {
            WarGame.Phases.Move.INTERSECTED = intersects[0].object;
            WarGame.Phases.Move.INTERSECTED.currentHex = WarGame.Phases.Move.INTERSECTED.material.emissive.getHex();
            WarGame.Phases.Move.INTERSECTED.material.emissive.setHex(0xff0000);
        }
    },

    handleMoveClick: function (event) {
        event.preventDefault();
        var team = WarGame.Teams.getCurrent();
        // get all players for team
        if (team) {
            var players = team.getPlayers().filter(function (p) {
                return !p.isBattling();
            });
            var intersects = WarGame.Utils.getMouseIntersects(event, players.map(function (p) { return p.obj; }));
            if (intersects.length > 0) {
                for (var i=0; i<players.length; i++) {
                    if (intersects[0].object === players[i].obj) {
                        var html = '' +
'<div class="panel panel-default">' +
'<div class="panel-heading">' +
'<h5 class="panel-title">' + team.name + ' Player, Type: ' + players[i].attributes.name + '</h5>' +
'<br>' + players[i].stats.toString() +
'</div>' +
'<div class="panel-body">' +
'<div class="form-group form-horizontal">' +
'<label for="horizontalLocation">Horizontal Location: ' + "(1-" + WarGame.Maps.getCurrent().getGrid()[0].length + ")" + '</label>' +
'<input id="x" type="text" value="' + players[i].location.x + '">' +
'<label for="verticalLocation">Vertical Location: ' + "(1-" + WarGame.Maps.getCurrent().getGrid().length + ")" + '</label>' +
'<input id="z" type="text" value="' + players[i].location.z + '">' +
'<button type="submit" onclick="WarGame.Phases.Move.movePlayer(\'' + team.name + '\',' + players[i].id + ');" class="btn btn-default">Move</button>' +
'</div>' +
'</div>' +
'</div>' +
'<button type="submit" onclick="WarGame.Phases.Move.endTurn();" class="btn btn-default">End Turn</button>';
                        WarGame.UI.setContents('moveRow', html);
                        break;
                    }
                }
            }
        }
    },
};
