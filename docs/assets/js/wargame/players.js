var WarGame = WarGame || {};
WarGame.Players = {};

WarGame.Players._array = [];

WarGame.Players.add = function (playerAttributes) {
    WarGame.Players._array.push(playerAttributes);
};

WarGame.Players.get = function () {
    return WarGame.Players._array;
};

WarGame.Players.getPlayerAttributesByName = function (name) {
    var players = WarGame.Players.get();
    for (var i=0; i<players.length; i++) {
        var pl = players[i];
        if (pl.name.toLowerCase() === name.toLowerCase()) {
            return pl;
        }
    }
    throw "unable to locate player: " + name;
};

WarGame.Players.createPlayer = function (name, team) {
    var attr = WarGame.Players.getPlayerAttributesByName(name);
    var p = new WarGame.Players.Base(attr, team);
    return p;
};
