var WarGame = WarGame || {};
WarGame.Battle = function () {
    this.attackers = [];
    this.opponents = [];
};

WarGame.Battle.prototype.addAttacker = function (player) {
    this._addPlayerTo(player, this.attackers);
};

WarGame.Battle.prototype.addOpponent = function (player) {
    this._addPlayerTo(player, this.opponents);
};

WarGame.Battle.prototype.addOpponents = function (playerArray) {
    for (var i=0; i<playerArray.length; i++) {
        this._addPlayerTo(playerArray[i], this.opponents);
    }
};

WarGame.Battle.prototype.addOpponent = function (player) {
    this.opponents.push(player);
};

WarGame.Battle.prototype.hasAttacker = function (player) {
    return this._hasPlayerIn(player, this.attackers);
};

WarGame.Battle.prototype.hasOpponent = function (player) {
    return this._hasPlayerIn(player, this.opponents);
};

WarGame.Battle.prototype.hasPlayer = function (player) {
    var hasAtk = this.hasAttacker(player);
    if (hasAtk) {
        return true;
    } else {
        return this.hasOpponent(player);
    }
};

WarGame.Battle.prototype.getPlayers = function () {
    var players = [], i;
    for (i=0; i<this.attackers.length; i++) {
        players.push(this.attackers[i]);
    }
    for (i=0; i<this.opponents.length; i++) {
        players.push(this.opponents[i]);
    }

    return players;
};

WarGame.Battle.prototype.start = function () {
    throw 'abstract base method cannot be called. please use concrete class.';
};

WarGame.Battle.prototype._getTotalAttackPoints = function (playerArray) {
    var points = 0;
    for (var i=0; i<playerArray.length; i++) {
        points += playerArray[i].stats.attacks;
    }

    return points;
};

WarGame.Battle.prototype._getHighestFightValue = function (playerArray) {
    var highest = 0;
    for (var i=0; i<playerArray.length; i++) {
        if (playerArray[i].stats.fight > highest) {
            highest = playerArray[i].stats.fight;
        }
    }

    return highest;
};

WarGame.Battle.prototype._addPlayerTo = function (player, array) {
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

WarGame.Battle.prototype._hasPlayerIn = function (player, array) {
    for (var i=0; i<array.length; i++) {
        if (player === array[i]) {
            return true;
        }
    }
    return false;
};
