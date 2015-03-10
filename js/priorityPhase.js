var WarGame = WarGame || {};
WarGame.PriorityPhase = {
    start: function () {
        document.querySelector('#currentPhase').innerHTML = 'PRIORITY';
        // roll dice for each team
        // TODO: handle more than two teams
        var one = WarGame.Utils.diceRoll()[0];
        var two = WarGame.Utils.diceRoll()[0];
        if (one === two) {
            WarGame.PriorityPhase.start();
        }
        if (one > two) {
            WarGame.currentTeam = 0;
        } else {
            WarGame.currentTeam = 1;
        }

        var elem = document.querySelector('#priorityTeam');
        elem.innerHTML = WarGame.teams[WarGame.currentTeam].name;

        WarGame.PriorityPhase.end();
    },

    end: function () {
        // move to next phase
        WarGame.nextPhase();
    }
};
