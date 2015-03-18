var WarGame = WarGame || {};
WarGame.Phases = WarGame.Phases || {};
WarGame.Phases.Priority = {
    start: function () {
        // roll dice for each team
        // TODO: handle more than two teams
        var one = WarGame.Utils.diceRoll()[0];
        var two = WarGame.Utils.diceRoll()[0];
        if (one === two) {
            WarGame.Phases.Priority.start();
        }
        if (one > two) {
            WarGame.Teams.setAsPriorityTeamByIndex(0);
        } else {
            WarGame.Teams.setAsPriorityTeamByIndex(1);
        }

        var team = WarGame.Teams.getCurrent();
        WarGame.UI.setCurrentTeamText(team.name);

        var players = WarGame.getPlayers();
        for (var i=0; i<players.length; i++) {
            if (players[i].team === team) {
                players[i].history[WarGame.Rounds.getCurrent()].priority = true;
            }
        }

        WarGame.Phases.Priority.end();
    },

    end: function () {
        // move to next phase
        WarGame.Phases.next();
    }
};
