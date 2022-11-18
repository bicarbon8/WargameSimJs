var WarGame = WarGame || {};
WarGame.Phases = WarGame.Phases || {};
WarGame.Phases.Fight = {
    INTERSECTED: null,
    battles: null,

    start: function () {
        WarGame.UI.setCurrentPhaseText('FIGHTING');

        var players = WarGame.getPlayers();
        for (var i=0; i<players.length; i++) {
            players[i].history[WarGame.Rounds.getCurrent()].fight.wounds = players[i].stats.wounds;
        }

        WarGame.Phases.Fight.battles = WarGame.Phases.Fight.getBattleGroups();
        WarGame.UI.Plotter.addListener('mousemove', WarGame.Phases.Fight.handleFightMouseMove);
        WarGame.UI.Plotter.addListener('click', WarGame.Phases.Fight.handleFightClick);
    },

    end: function () {
        WarGame.UI.setCurrentPhaseText('');
        WarGame.Phases.Fight.battles = null;
        WarGame.UI.Plotter.removeListener('mousemove', WarGame.Phases.Fight.handleFightMouseMove);
        WarGame.UI.Plotter.removeListener('click', WarGame.Phases.Fight.handleFightClick);
        // move to next phase
        WarGame.Phases.next();
    },

    getBattleGroups: function () {
        var battles = [];
        var pTeamPlayers = WarGame.Teams.getPriority().getPlayers();
        for (var i=0; i<pTeamPlayers.length; i++) {
            var player = pTeamPlayers[i];
            var opponents = player.getOpponentsInMeleRange();
            if (opponents.length > 0) {
                // see if this player's opponents are already in battle
                var inBattle = false;
                for (var j=0; j<battles.length; j++) {
                    for (var k=0; k<opponents.length; k++) {
                        if (battles[j].hasOpponent(opponents[k])) {
                            battles[j].addAttacker(player);
                            battles[j].addOpponents(opponents);
                            inBattle = true;
                            break;
                        }
                    }
                    if (inBattle) {
                        break;
                    }
                }
                if (!inBattle) {
                    var battle = new WarGame.Battles.Mele();
                    battle.addAttacker(player);
                    battle.addOpponents(opponents);
                    battles.push(battle);
                }
            }
        }

        return battles;
    },

    /**
     * function will highlight the different battles when the mouse hovers over them
     */
    handleFightMouseMove: function (event) {
        event.preventDefault();
        var intersects = WarGame.Utils.getMouseIntersects(event, WarGame.getPlayers().map(function (p) {
            return p.obj;
        }));

        if (WarGame.Phases.Fight.INTERSECTED && WarGame.Phases.Fight.INTERSECTED.length > 0) {
            for (i=0; i<WarGame.Phases.Fight.INTERSECTED.length; i++) {
                WarGame.Phases.Fight.INTERSECTED[i].obj.material.emissive.setHex(WarGame.Phases.Fight.INTERSECTED.currentHex);
            }
            WarGame.Phases.Fight.INTERSECTED = null;
        }

        var i;
        if (intersects.length > 0) {
            // get battle group
            for (i=0; i<WarGame.Phases.Fight.battles.length; i++) {
                var players = WarGame.Phases.Fight.battles[i].getPlayers();
                for (var j=0; j<players.length; j++) {
                    if (players[j].obj === intersects[0].object) {
                        WarGame.Phases.Fight.INTERSECTED = players;
                        break;
                    }
                }
                if (WarGame.Phases.Fight.INTERSECTED) {
                    break;
                }
            }

            if (WarGame.Phases.Fight.INTERSECTED && WarGame.Phases.Fight.INTERSECTED.length > 0) {
                for (i=0; i<WarGame.Phases.Fight.INTERSECTED.length; i++) {
                    WarGame.Phases.Fight.INTERSECTED[i].obj.currentHex = WarGame.Phases.Fight.INTERSECTED[i].obj.material.emissive.getHex();
                    WarGame.Phases.Fight.INTERSECTED[i].obj.material.emissive.setHex(0xff0000);
                }
            }
        }
    },

    handleFightClick: function (event) {
        event.preventDefault();
        var intersects = WarGame.Utils.getMouseIntersects(event, WarGame.getPlayers().map(function (p) {
            return p.obj;
        }));

        var i;
        if (intersects.length > 0) {
            // get battle group
            var started = false;
            for (i=0; i<WarGame.Phases.Fight.battles.length; i++) {
                var players = WarGame.Phases.Fight.battles[i].getPlayers();
                for (var j=0; j<players.length; j++) {
                    if (players[j].obj === intersects[0].object) {
                        started = true;
                        var b = WarGame.Phases.Fight.battles[i];
                        WarGame.Phases.Fight.battles.splice(i, 1); // remove this battle
                        b.start();
                        break;
                    }
                }
            }

            // end phase if no more battles exist
            if (WarGame.Phases.Fight.battles.length < 1) {
                WarGame.Phases.Fight.end();
            }
        }
    },
};
