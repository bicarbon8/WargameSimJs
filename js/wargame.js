var WarGame = WarGame || {};
WarGame.CURRENT_TEAM = 0;
WarGame.PRIORITY_TEAM = 0;
WarGame.MAX_BLOCK_HEIGHT = 5;
WarGame.STEP_OFFSET = 0.5;

WarGame.initialize = function () {
    WarGame.Teams.add(new WarGame.Teams.Team("RED", 0xff0000, 100));
    WarGame.Teams.add(new WarGame.Teams.Team("BLUE", 0x0044ff, 100));
    WarGame.UI.initialize();
};

WarGame.setMap = function(type) {
    if (WarGame.Maps.getCurrent()) {
        // remove existing players and map
        WarGame.UI.removeMesh(WarGame.Maps.getCurrent().getObj());
        WarGame.Maps.reset();
        var teams = WarGame.Teams.get();
        for (var i=0; i<teams.length; i++) {
            teams[i].reset();
        }
    }
    var map = WarGame.Maps.setCurrent(type);
    WarGame.UI.addMesh(map.getObj());
};

WarGame.addPlayer = function (type, team, startingLocation) {
    // get player definition
    try {
        var player = WarGame.Players.createPlayer(type);
        WarGame.Teams.get()[team].addPlayer(player);
        WarGame.Maps.getCurrent().addPlayer(player, new WarGame.Players.Location(startingLocation.x, 0, startingLocation.z));
    } catch (e) {
        WarGame.UI.displayAlert(e);
    }
};

WarGame.removePlayer = function (player) {
    player.team.removePlayer(player);
    WarGame.Maps.getCurrent().removePlayer(player);
};

WarGame.getPlayers = function () {
    return WarGame.Maps.getCurrent().getPlayers();
};

WarGame.render = function () {
    WarGame.UI.update();
};

WarGame.reset = function () {
    WarGame.Maps.reset();
    WarGame.Phases.reset();
    WarGame.Rounds.reset();
    WarGame.UI.reset();
    WarGame.Teams.reset();

    WarGame.initialize();
    // TODO: reset ALL THE THINGS!
};

WarGame.start = function () {
    // TODO: create menus for picking teams, etc.
    WarGame.Phases.doCurrent();
};

WarGame.onPlayerDefeated = function (player) {
    WarGame.UI.displayDefeatedAlert(player);
    WarGame.removePlayer(player);
};
