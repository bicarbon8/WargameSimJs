var WarGame = WarGame || {};
WarGame.MeleBattle = function () {
    WarGame.Battle.call(this);
};
WarGame.MeleBattle.prototype = Object.create(WarGame.Battle.prototype);
WarGame.MeleBattle.prototype.constructor = WarGame.MeleBattle;

WarGame.MeleBattle.prototype.start = function () {
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
    for (i=0; i<opponentScores.length; i++) {
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
        alert(this.attackers[0].team.name + ' scores a hit.');
        winner = this.attackers;
        loser = this.opponents;
        attacks = attackScores;
    } else {
        // TODO: highlight winners
        alert(this.opponents[0].team.name + ' scores a hit.');
        winner = this.opponents;
        loser = this.attackers;
        attacks = opponentScores;
    }
    for (i=0; i<winner.length; i++) {
        var success = WarGame.WoundChart.tryWound(winner[i], loser[0]);
        if (success) {
            alert(winner[i].team.name + ' damaged his opponent.');
            // TODO: let winner pick who to wound
            loser[0].wound();
            if (loser[0].stats.wounds < 1) {
                loser.shift();
                if (loser.length < 1) {
                    break;
                }
            }
        } else {
            alert(winner[0].team.name + ' caused no damage.');
        }
    }
};
