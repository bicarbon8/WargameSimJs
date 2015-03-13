var WarGame = WarGame || {};
WarGame.ShootPhase = {
    INTERSECTED: null,
    TEAMS_DONE_PHASE: 0,
    battle: null,
    pickFromTeam: WarGame.CURRENT_TEAM,
    opponentsInRange: null,

    start: function () {
        document.querySelector('#currentPhase').innerHTML = 'SHOOTING';

        var players = WarGame.map.getPlayers();
        for (var i=0; i<players.length; i++) {
            players[i].history[WarGame.CURRENT_ROUND].shoot.wounds = players[i].stats.wounds;
        }

        WarGame.ShootPhase.battle = new WarGame.RangedBattle();
        WarGame.Plotter.renderer.domElement.addEventListener('mousemove', WarGame.ShootPhase.handleShootMouseMove, false);
        WarGame.Plotter.renderer.domElement.addEventListener('click', WarGame.ShootPhase.handleShootClick, false);
        document.querySelector('#shootRow').innerHTML = '' +
'<button type="submit" onclick="WarGame.ShootPhase.endTurn();" class="btn btn-default">End Turn</button>';
    },

    endTurn: function () {
        WarGame.ShootPhase.TEAMS_DONE_PHASE++;

        WarGame.nextTeam();

        if (WarGame.ShootPhase.TEAMS_DONE_PHASE >= WarGame.teams.length) {
            WarGame.ShootPhase.TEAMS_DONE_PHASE = 0;
            WarGame.ShootPhase.end();
        }
    },

    end: function () {
        document.querySelector('#shootRow').innerHTML = '';
        WarGame.ShootPhase.battle = null;
        WarGame.Plotter.renderer.domElement.removeEventListener('mousemove', WarGame.ShootPhase.handleShootMouseMove, false);
        WarGame.Plotter.renderer.domElement.removeEventListener('click', WarGame.ShootPhase.handleShootClick, false);
        // move to next phase
        WarGame.nextPhase();
    },

    /**
     * function will highlight the different battles when the mouse hovers over them
     */
    handleShootMouseMove: function (event) {
        event.preventDefault();
        var intersects, players;

        if (WarGame.ShootPhase.battle.getPlayers().length === 0) {
            // pick attacker
            players = WarGame.teams[WarGame.CURRENT_TEAM].players.filter(function (p) {
                return !p.isBattling() && !p.history[WarGame.CURRENT_ROUND].shoot.done;
            });
            intersects = WarGame.Utils.getMouseIntersects(event, WarGame.teams[WarGame.CURRENT_TEAM].players.map(function (p) {
                return p.obj;
            }));
        } else {
            // pick opponents in range
            players = WarGame.ShootPhase.inRangeOpponents;
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
        var intersects, players;

        if (WarGame.ShootPhase.battle.getPlayers().length === 0) {
            // pick attacker who is not already engaged in battle
            players = WarGame.teams[WarGame.CURRENT_TEAM].players.filter(function (p) {
                return !p.isBattling() && !p.history[WarGame.CURRENT_ROUND].shoot.done;
            });
            intersects = WarGame.Utils.getMouseIntersects(event, WarGame.teams[WarGame.CURRENT_TEAM].players.map(function (p) {
                return p.obj;
            }));
        } else {
            // pick opponents in range
            players = WarGame.ShootPhase.inRangeOpponents;
            intersects = WarGame.Utils.getMouseIntersects(event, WarGame.ShootPhase.inRangeOpponents.map(function (p) {
                return p.obj;
            }));
        }

        if (intersects.length > 0) {
            // get battle group
            /* jshint loopfunc: true */
            for (var j=0; j<players.length; j++) {
                if (players[j].obj === intersects[0].object) {
                    if (WarGame.ShootPhase.battle.getPlayers().length === 0) {
                        var inRange = WarGame.map.getOpponentsInShootRange(players[j]);
                        if (inRange.length === 0) {
                            WarGame.UI.displayAlert('selected shooter has no opponents in range.', WarGame.UI.ALERT_INFO);
                        } else {
                            WarGame.ShootPhase.battle.addAttacker(players[j]);
                            WarGame.ShootPhase.inRangeOpponents = inRange;
                            players[j].history[WarGame.CURRENT_ROUND].shoot.done = true;
                        }
                        break;
                    } else {
                        WarGame.ShootPhase.battle.attacksRemaining--;
                        WarGame.ShootPhase.battle.addOpponent(players[j]);
                        if (WarGame.ShootPhase.battle.attacksRemaining <= 0) {
                            WarGame.ShootPhase.battle.start();
                            WarGame.ShootPhase.battle = new WarGame.RangedBattle();
                        }
                        break;
                    }
                }
            }
        }
    },
};
