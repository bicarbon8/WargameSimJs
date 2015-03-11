var WarGame = WarGame || {};
WarGame.FightPhase = {
    INTERSECTED: null,
    battles: null,

    start: function () {
        document.querySelector('#currentPhase').innerHTML = 'FIGHTING';

        var players = WarGame.map.getPlayers();
        for (var i=0; i<players.length; i++) {
            players[i].history[WarGame.CURRENT_ROUND].fight.wounds = players[i].stats.wounds;
        }

        WarGame.FightPhase.battles = WarGame.FightPhase.getBattleGroups();
        WarGame.Plotter.renderer.domElement.addEventListener('mousemove', WarGame.FightPhase.handleFightMouseMove, false);
        WarGame.Plotter.renderer.domElement.addEventListener('click', WarGame.FightPhase.handleFightClick, false);
    },

    end: function () {
        WarGame.FightPhase.battles = null;
        document.querySelector('#fightRow').innerHTML = '';
        WarGame.Plotter.renderer.domElement.removeEventListener('mousemove', WarGame.FightPhase.handleFightMouseMove, false);
        WarGame.Plotter.renderer.domElement.removeEventListener('click', WarGame.FightPhase.handleFightClick, false);
        // move to next phase
        WarGame.nextPhase();
    },

    getBattleGroups: function () {
        var battles = [];
        var pTeamPlayers = WarGame.teams[WarGame.PRIORITY_TEAM].players;
        for (var i=0; i<pTeamPlayers.length; i++) {
            var player = pTeamPlayers[i];
            var opponents = WarGame.map.getOpponentsInMeleRange(player);
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
                    var battle = new WarGame.MeleBattle();
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
        var intersects = WarGame.Utils.getMouseIntersects(event, WarGame.map.getPlayers().map(function (p) {
            return p.obj;
        }));

        if (WarGame.FightPhase.INTERSECTED && WarGame.FightPhase.INTERSECTED.length > 0) {
            for (i=0; i<WarGame.FightPhase.INTERSECTED.length; i++) {
                WarGame.FightPhase.INTERSECTED[i].obj.material.emissive.setHex(WarGame.FightPhase.INTERSECTED.currentHex);
            }
            WarGame.FightPhase.INTERSECTED = null;
        }

        var i;
        if (intersects.length > 0) {
            // get battle group
            for (i=0; i<WarGame.FightPhase.battles.length; i++) {
                var players = WarGame.FightPhase.battles[i].getPlayers();
                for (var j=0; j<players.length; j++) {
                    if (players[j].obj === intersects[0].object) {
                        WarGame.FightPhase.INTERSECTED = players;
                        break;
                    }
                }
                if (WarGame.FightPhase.INTERSECTED) {
                    break;
                }
            }

            if (WarGame.FightPhase.INTERSECTED && WarGame.FightPhase.INTERSECTED.length > 0) {
                for (i=0; i<WarGame.FightPhase.INTERSECTED.length; i++) {
                    WarGame.FightPhase.INTERSECTED[i].obj.currentHex = WarGame.FightPhase.INTERSECTED[i].obj.material.emissive.getHex();
                    WarGame.FightPhase.INTERSECTED[i].obj.material.emissive.setHex(0xff0000);
                }
            }
        }
    },

    handleFightClick: function (event) {
        event.preventDefault();
        var intersects = WarGame.Utils.getMouseIntersects(event, WarGame.map.getPlayers().map(function (p) {
            return p.obj;
        }));

        var i;
        if (intersects.length > 0) {
            // get battle group
            var started = false;
            for (i=0; i<WarGame.FightPhase.battles.length; i++) {
                var players = WarGame.FightPhase.battles[i].getPlayers();
                for (var j=0; j<players.length; j++) {
                    if (players[j].obj === intersects[0].object) {
                        started = true;
                        var b = WarGame.FightPhase.battles[i];
                        WarGame.FightPhase.battles.splice(i, 1); // remove this battle
                        b.start();
                        break;
                    }
                }
            }

            // end phase if no more battles exist
            if (WarGame.FightPhase.battles.length < 1) {
                WarGame.FightPhase.end();
            }
        }
    },
};
