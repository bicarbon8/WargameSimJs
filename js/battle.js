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

WarGame.Battle.prototype.start = function (opponent) {
    // roll to determine which side wins the attack
    var attackScores = WarGame.Utils.diceRoll(this._getTotalAttackPoints(this.attackers));
    var opponentScores = WarGame.Utils.diceRoll(this._getTotalAttackPoints(this.opponents));
    var i, atkTopScore = 0;
    for (i=0; i<attackScores.length; i++) {
        if (attackScores[i] > atkTopScore) {
            atkTopScore = attackScores[i];
        }
    }
    var oppTopScore = 0;
    for (i=0; i<opponentScores.length; i++)     {
        if (opponentScores[i] > oppTopScore) {
            oppTopScore = opponentScores[i];
        }
    }
    // handle a tie
    if (atkTopScore === oppTopScore) {
        // compare highest fight values
        var atkF = this._getHighestFightValue(this.attackers);
        var oppF = this._getHighestFightValue(this.opponents);
        // handle matching fight values
        if (atkF === oppF) {
            // reroll to decide winner
            var roll = WarGame.Utils.diceRoll()[0];
            if (roll > 3) {
                atkTopScore++;
            } else {
                oppTopScore++;
            }
        } else if (atkF > oppF) {
            atkTopScore++;
        } else {
            oppTopScore++;
        }
    }
    // TODO: move loser back 1 space or handle trapped condition
    var winner, loser, attacks;
    if (atkTopScore > oppTopScore) {
        // TODO: highlight winners
        alert(this.attackers[0].team.name + ' wins the attack.');
        winner = this.attackers;
        loser = this.opponents;
        attacks = attackScores;
    } else {
        // TODO: highlight winners
        alert(this.opponents[0].team.name + ' wins the attack.');
        winner = this.opponents;
        loser = this.attackers;
        attacks = opponentScores;
    }
    for (i=0; i<winner.length; i++) {
        var success = WarGame.WoundChart.tryWound(winner[i], loser[0]);
        if (success) {
            alert(winner[0].team.name + ' scored a hit.');
            // TODO: let winner pick who to wound
            loser[0].wound();
            if (loser[0].attributes.stats.wounds < 1) {
                loser.shift();
                if (loser.length < 1) {
                    break;
                }
            }
        } else {
            alert(winner[0].team.name + ' missed.');
        }
    }
};

WarGame.Battle.prototype._getTotalAttackPoints = function (playerArray) {
    var points = 0;
    for (var i=0; i<playerArray.length; i++) {
        points += playerArray[i].attributes.stats.attacks;
    }

    return points;
};

WarGame.Battle.prototype._getHighestFightValue = function (playerArray) {
    var highest = 0;
    for (var i=0; i<playerArray.length; i++) {
        if (playerArray[i].attributes.stats.fight > highest) {
            highest = playerArray[i].attributes.stats.fight;
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
