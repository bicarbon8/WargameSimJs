var WarGame = WarGame || {};
WarGame.ShootPhase = {
    INTERSECTED: null,
    TEAMS_DONE_PHASE: 0,
    battle: null,
    pickFromTeam: WarGame.currentTeam,
    opponentsInRange: null,

    start: function () {
        document.querySelector('#currentPhase').innerHTML = 'SHOOTING';
        WarGame.ShootPhase.battle = new WarGame.RangedBattle();
        WarGame.Plotter.renderer.domElement.addEventListener('mousemove', WarGame.ShootPhase.handleShootMouseMove, false);
        WarGame.Plotter.renderer.domElement.addEventListener('click', WarGame.ShootPhase.handleShootClick, false);
        document.querySelector('#shootRow').innerHTML = '' +
'<button type="submit" onclick="WarGame.ShootPhase.endTurn();" class="btn btn-default">End Turn</button>';
    },

    endTurn: function () {
        WarGame.MovePhase.TEAMS_DONE_PHASE++;

        // TODO: handle more than 2 teams
        if (WarGame.currentTeam === 0) {
            WarGame.currentTeam = 1;
        } else {
            WarGame.currentTeam = 0;
        }
        var elem = document.querySelector('#priorityTeam');
        elem.innerHTML = WarGame.teams[WarGame.currentTeam].name;

        if (WarGame.ShootPhase.TEAMS_DONE_PHASE >= WarGame.teams.length) {
            WarGame.ShootPhase.TEAMS_DONE_PHASE = 0;
            WarGame.ShootPhase.end();
        }
    },

    end: function () {
        // move to next phase
        WarGame.nextPhase();
    },

    /**
     * function will highlight the different battles when the mouse hovers over them
     */
    handleShootMouseMove: function (event) {
        event.preventDefault();
        var intersects;

        if (WarGame.ShootPhase.battle.getPlayers().length === 0) {
            // pick attacker
            intersects = WarGame.Utils.getMouseIntersects(event, WarGame.teams[WarGame.currentTeam].players.map(function (p) {
                return p.obj;
            }));
        } else {
            // pick opponents in range
            intersects = WarGame.Utils.getMouseIntersects(event, WarGame.ShootPhase.inRangeOpponents.map(function (p) {
                return p.obj;
            }));
        }

        if (WarGame.ShootPhase.INTERSECTED) {
            WarGame.ShootPhase.INTERSECTED.obj.material.emissive.setHex(WarGame.ShootPhase.INTERSECTED.currentHex);
            WarGame.ShootPhase.INTERSECTED = null;
        }

        if (intersects.length > 0) {
            // get battle group
            var players = WarGame.map.getPlayers();
            for (var j=0; j<players.length; j++) {
                if (players[j].obj === intersects[0].object) {
                    WarGame.ShootPhase.INTERSECTED = players[j];
                    WarGame.ShootPhase.INTERSECTED.currentHex = WarGame.ShootPhase.INTERSECTED.obj.material.emissive.getHex();
                    WarGame.ShootPhase.INTERSECTED.obj.material.emissive.setHex(0xff0000);
                    break;
                }
            }
        }
    },

    handleShootClick: function (event) {
        event.preventDefault();
        var intersects;

        if (WarGame.ShootPhase.battle.getPlayers().length === 0) {
            // pick attacker
            intersects = WarGame.Utils.getMouseIntersects(event, WarGame.teams[WarGame.currentTeam].players.map(function (p) {
                return p.obj;
            }));
        } else {
            // pick opponents in range
            intersects = WarGame.Utils.getMouseIntersects(event, WarGame.ShootPhase.inRangeOpponents.map(function (p) {
                return p.obj;
            }));
        }

        if (intersects.length > 0) {
            // get battle group
            var players = WarGame.map.getPlayers();
            /* jshint loopfunc: true */
            for (var j=0; j<players.length; j++) {
                if (players[j].obj === intersects[0].object) {
                    if (players[j].team === WarGame.teams[WarGame.currentTeam]) {
                        WarGame.ShootPhase.battle.addAttacker(players[j]);
                        WarGame.ShootPhase.inRangeOpponents = WarGame.map.getOpponentsInShootRange(players[j]);
                        break;
                    } else {
                        WarGame.ShootPhase.battle.attacksRemaining--;
                        WarGame.ShootPhase.battle.addOpponent(players[j]);
                        if (WarGame.ShootPhase.battle.attacksRemaining <= 0) {
                            WarGame.ShootPhase.battle.start();
                            WarGame.ShootPhase.battle = new WarGame.RangedBattle();
                        }
                    }
                    break;
                }
            }
        }
    },
};
