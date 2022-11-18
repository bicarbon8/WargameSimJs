var WarGame = WarGame || {};
WarGame.Teams = {};

WarGame.Teams.POINTS_PER_TEAM = 0;
WarGame.Teams.CURRENT = 0;
WarGame.Teams.PRIORITY = 0;
WarGame.Teams._array = [];

WarGame.Teams.get = function () {
    return WarGame.Teams._array;
};

WarGame.Teams.add = function (team) {
    if (team instanceof WarGame.Teams.Team && WarGame.Teams._array.indexOf(team) < 0) {
        WarGame.Teams._array.push(team);
    }
};

WarGame.Teams.setTotalPoints = function (points) {
    if (!isNaN(points)) {
        WarGame.Teams.POINTS_PER_TEAM = Math.floor(points / WarGame.Teams.get().length);
    }
};

WarGame.Teams.getPointsPerTeam = function () {
    return WarGame.Teams.POINTS_PER_TEAM;
};

WarGame.Teams.getTeamIndexByName = function (name) {
    var teams = WarGame.Teams.get();
    for (var i=0; i<teams.length; i++) {
        if (teams[i].name.toLowerCase() === name.toLowerCase()) {
            return i;
        }
    }

    throw "unable to locate team with name: " + name;
};

WarGame.Teams.getTeamByName = function (name) {
    var teams = WarGame.Teams.get();
    for (var i=0; i<teams.length; i++) {
        if (teams[i].name.toLowerCase() === name.toLowerCase()) {
            return teams[i];
        }
    }

    throw "unable to locate team with name: " + name;
};

WarGame.Teams.getCurrent = function () {
    return WarGame.Teams.get()[WarGame.Teams.CURRENT];
};

WarGame.Teams.getPriority = function () {
    return WarGame.Teams.get()[WarGame.Teams.PRIORITY];
};

WarGame.Teams.setAsPriorityTeamByIndex = function (index) {
    WarGame.Teams.PRIORITY = index;
    WarGame.Teams.CURRENT = index;
};

WarGame.Teams.next = function () {
    WarGame.Teams.CURRENT++;
    if (WarGame.Teams.CURRENT > 1) {
        WarGame.Teams.CURRENT = 0;
    }
    WarGame.UI.setCurrentTeamText(WarGame.Teams.getCurrent().name);
};

WarGame.Teams.reset = function () {
    WarGame.Teams.CURRENT = 0;
    WarGame.Teams._array = [];
};
