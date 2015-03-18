var WarGame = WarGame || {};
WarGame.Battles = WarGame.Battles || {};
WarGame.Battles.Base = function () {
    this.attackers = [];
    this.opponents = [];
};

WarGame.Battles.Base.prototype.addAttacker = function (player) {
    this._addPlayerTo(player, this.attackers);
};

WarGame.Battles.Base.prototype.addOpponent = function (player) {
    this._addPlayerTo(player, this.opponents);
};

WarGame.Battles.Base.prototype.addOpponents = function (playerArray) {
    for (var i=0; i<playerArray.length; i++) {
        this.addOpponent(playerArray[i]);
    }
};

WarGame.Battles.Base.prototype.addOpponent = function (player) {
    this._addPlayerTo(player, this.opponents);
};

WarGame.Battles.Base.prototype.hasAttacker = function (player) {
    return this._hasPlayerIn(player, this.attackers);
};

WarGame.Battles.Base.prototype.hasOpponent = function (player) {
    return this._hasPlayerIn(player, this.opponents);
};

WarGame.Battles.Base.prototype.hasPlayer = function (player) {
    var hasAtk = this.hasAttacker(player);
    if (hasAtk) {
        return true;
    } else {
        return this.hasOpponent(player);
    }
};

WarGame.Battles.Base.prototype.getPlayers = function () {
    var players = [], i;
    for (i=0; i<this.attackers.length; i++) {
        players.push(this.attackers[i]);
    }
    for (i=0; i<this.opponents.length; i++) {
        players.push(this.opponents[i]);
    }

    return players;
};

WarGame.Battles.Base.prototype.start = function () {
    throw 'abstract base method cannot be called. please use concrete class.';
};

WarGame.Battles.Base.prototype._addPlayerTo = function (player, array) {
    // ensure not already here
    var alreadyExists = false;
    for (var i=0; i<array.length; i++) {
        if (player === array[i]) {
            alreadyExists = true;
            break;
        }
    }
    if (!alreadyExists) {
        array.push(player);
    }
};

WarGame.Battles.Base.prototype._hasPlayerIn = function (player, array) {
    for (var i=0; i<array.length; i++) {
        if (player === array[i]) {
            return true;
        }
    }
    return false;
};
