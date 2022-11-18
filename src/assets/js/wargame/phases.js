var WarGame = WarGame || {};
WarGame.Phases = {};

WarGame.Phases.PRIORITY = 0;
WarGame.Phases.MOVEMENT = 1;
WarGame.Phases.SHOOTING = 2;
WarGame.Phases.FIGHTING = 3;

WarGame.Phases.CURRENT = WarGame.Phases.PRIORITY; // start at 0

WarGame.Phases.TEAMS_DONE = 0; // tracks number of teams who have completed current phase

WarGame.Phases.getCurrentPhaseName = function () {
    switch (WarGame.Phases.CURRENT) {
        case WarGame.Phases.PRIORITY:
            return 'PRIORITY';
        case WarGame.Phases.MOVEMENT:
            return 'MOVEMENT';
        case WarGame.Phases.SHOOTING:
            return 'SHOOTING';
        case WarGame.Phases.FIGHTING:
            return 'FIGHTING';
    }
};

WarGame.Phases.doCurrent = function () {
    WarGame.UI.setCurrentTeamText(WarGame.Teams.getCurrent().name);

    switch (WarGame.Phases.CURRENT) {
        case WarGame.Phases.PRIORITY:
            WarGame.Phases.Priority.start();
            break;
        case WarGame.Phases.MOVEMENT:
            WarGame.Phases.Move.start();
            break;
        case WarGame.Phases.SHOOTING:
            WarGame.Phases.Shoot.start();
            break;
        case WarGame.Phases.FIGHTING:
            WarGame.Phases.Fight.start();
            break;
        default:
            // TODO: log this
            WarGame.Phases.CURRENT = WarGame.Phases.PRIORITY;
            WarGame.Phases.doCurrent();
    }
};

WarGame.Phases.next = function () {
    // end phase
    WarGame.Phases.CURRENT++;
    if (WarGame.Phases.CURRENT > WarGame.Phases.FIGHTING) {
        WarGame.Phases.CURRENT = WarGame.Phases.PRIORITY;
        WarGame.Rounds.next();
    }

    // start next phase
    WarGame.Phases.doCurrent();
};

WarGame.Phases.reset = function () {
    WarGame.Phases.CURRENT = WarGame.Phases.PRIORITY;
};
