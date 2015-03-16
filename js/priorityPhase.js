var WarGame = WarGame || {};
WarGame.PriorityPhase = {
    start: function () {
        // roll dice for each team
        // TODO: handle more than two teams
        var one = WarGame.Utils.diceRoll()[0];
        var two = WarGame.Utils.diceRoll()[0];
        if (one === two) {
            WarGame.PriorityPhase.start();
        }
        if (one > two) {
            WarGame.CURRENT_TEAM = 0;
            WarGame.PRIORITY_TEAM = 0;
        } else {
            WarGame.CURRENT_TEAM = 1;
            WarGame.PRIORITY_TEAM = 1;
        }

        WarGame.UI.setCurrentTeamText(WarGame.teams[WarGame.PRIORITY_TEAM].name);

        var players = WarGame.map.getPlayers();
        for (var i=0; i<players.length; i++) {
            if (players[i].team === WarGame.teams[WarGame.PRIORITY_TEAM]) {
                players[i].history[WarGame.CURRENT_ROUND].priority = true;
            }
        }

        WarGame.PriorityPhase.end();
    },

    end: function () {
        // move to next phase
        WarGame.nextPhase();
    }
};
