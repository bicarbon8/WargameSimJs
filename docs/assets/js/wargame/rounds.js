var WarGame = WarGame || {};
WarGame.Rounds = {};

WarGame.Rounds.CURRENT = 0;

WarGame.Rounds.getCurrent = function () {
    return WarGame.Rounds.CURRENT;
};

WarGame.Rounds.next = function () {
    WarGame.Rounds.CURRENT++;
    // add history record for new round for all players
    var players = WarGame.getPlayers();
    for (var i=0; i<players.length; i++) {
        players[i].history.push(new WarGame.Rounds.History());
    }
    return WarGame.Rounds.getCurrent();
};

WarGame.Rounds.reset = function () {
    WarGame.Rounds.CURRENT = 0;
};
