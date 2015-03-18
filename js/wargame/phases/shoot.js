var WarGame = WarGame || {};
WarGame.Phases = WarGame.Phases || {};
WarGame.Phases.Shoot = {
    INTERSECTED: null,
    TEAMS_DONE_PHASE: 0,
    battle: null,
    pickFromTeam: WarGame.Teams.getCurrent(),
    opponentsInRange: null,

    start: function () {
        var players = WarGame.getPlayers();
        for (var i=0; i<players.length; i++) {
            players[i].history[WarGame.Rounds.getCurrent()].shoot.wounds = players[i].getWounds();
        }

        WarGame.Phases.Shoot.battle = new WarGame.Battles.Ranged();
        WarGame.UI.Plotter.renderer.domElement.addEventListener('mousemove', WarGame.Phases.Shoot.handleShootMouseMove, false);
        WarGame.UI.Plotter.renderer.domElement.addEventListener('click', WarGame.Phases.Shoot.handleShootClick, false);
        document.querySelector('#shootRow').innerHTML = '' +
'<button type="submit" onclick="WarGame.Phases.Shoot.endTurn();" class="btn btn-default">End Turn</button>';
    },

    endTurn: function () {
        WarGame.Phases.Shoot.TEAMS_DONE_PHASE++;

        WarGame.Teams.next();

        document.querySelector('#shootRow').innerHTML = '' +
'<button type="submit" onclick="WarGame.Phases.Shoot.endTurn();" class="btn btn-default">End Turn</button>';

        if (WarGame.Phases.Shoot.TEAMS_DONE_PHASE >= WarGame.Teams.get().length) {
            WarGame.Phases.Shoot.TEAMS_DONE_PHASE = 0;
            WarGame.Phases.Shoot.end();
        }
    },

    end: function () {
        document.querySelector('#shootRow').innerHTML = '';
        WarGame.Phases.Shoot.battle = null;
        WarGame.UI.Plotter.renderer.domElement.removeEventListener('mousemove', WarGame.Phases.Shoot.handleShootMouseMove, false);
        WarGame.UI.Plotter.renderer.domElement.removeEventListener('click', WarGame.Phases.Shoot.handleShootClick, false);
        // move to next phase
        WarGame.Phases.next();
    },

    /**
     * function will highlight the different battles when the mouse hovers over them
     */
    handleShootMouseMove: function (event) {
        event.preventDefault();
        var intersects, players;

        if (WarGame.Phases.Shoot.battle.getPlayers().length === 0) {
            // pick attacker
            players = WarGame.Teams.getCurrent().getPlayers().filter(function (p) {
                return !p.isBattling() && !p.history[WarGame.Rounds.getCurrent()].shoot.done;
            });
            intersects = WarGame.Utils.getMouseIntersects(event, WarGame.Teams.getCurrent().players.map(function (p) {
                return p.obj;
            }));
        } else {
            // pick opponents in range
            players = WarGame.Phases.Shoot.inRangeOpponents;
            intersects = WarGame.Utils.getMouseIntersects(event, WarGame.Phases.Shoot.inRangeOpponents.map(function (p) {
                return p.obj;
            }));
        }

        if (WarGame.Phases.Shoot.INTERSECTED) {
            WarGame.Phases.Shoot.INTERSECTED.obj.material.emissive.setHex(WarGame.Phases.Shoot.INTERSECTED.currentHex);
            WarGame.Phases.Shoot.INTERSECTED = null;
        }

        if (intersects.length > 0) {
            // get battle group
            for (var j=0; j<players.length; j++) {
                if (players[j].obj === intersects[0].object) {
                    WarGame.Phases.Shoot.INTERSECTED = players[j];
                    WarGame.Phases.Shoot.INTERSECTED.currentHex = WarGame.Phases.Shoot.INTERSECTED.obj.material.emissive.getHex();
                    WarGame.Phases.Shoot.INTERSECTED.obj.material.emissive.setHex(0xff0000);
                    break;
                }
            }
        }
    },

    handleShootClick: function (event) {
        event.preventDefault();
        var intersects, players;

        if (WarGame.Phases.Shoot.battle.getPlayers().length === 0) {
            // pick attacker who is not already engaged in battle
            players = WarGame.Teams.getCurrent().players.filter(function (p) {
                return !p.isBattling() && !p.history[WarGame.Rounds.getCurrent()].shoot.done;
            });
            intersects = WarGame.Utils.getMouseIntersects(event, WarGame.Teams.getCurrent().players.map(function (p) {
                return p.obj;
            }));
        } else {
            // pick opponents in range
            players = WarGame.Phases.Shoot.inRangeOpponents;
            intersects = WarGame.Utils.getMouseIntersects(event, WarGame.Phases.Shoot.inRangeOpponents.map(function (p) {
                return p.obj;
            }));
        }

        if (intersects.length > 0) {
            // get battle group
            /* jshint loopfunc: true */
            for (var j=0; j<players.length; j++) {
                if (players[j].obj === intersects[0].object) {
                    if (WarGame.Phases.Shoot.battle.getPlayers().length === 0) {
                        var inRange = players[j].getOpponentsInShootRange();
                        if (inRange.length === 0) {
                            WarGame.UI.displayAlert('selected shooter has no opponents in range.', WarGame.UI.ALERT_INFO);
                        } else {
                            WarGame.Phases.Shoot.battle.addAttacker(players[j]);
                            WarGame.Phases.Shoot.inRangeOpponents = inRange;
                            players[j].history[WarGame.Rounds.getCurrent()].shoot.done = true;
                        }
                        break;
                    } else {
                        WarGame.Phases.Shoot.battle.attacksRemaining--;
                        WarGame.Phases.Shoot.battle.addOpponent(players[j]);
                        if (WarGame.Phases.Shoot.battle.attacksRemaining <= 0) {
                            WarGame.Phases.Shoot.battle.start();
                            WarGame.Phases.Shoot.battle = new WarGame.Battles.Ranged();
                        }
                        break;
                    }
                }
            }
        }
    },
};
