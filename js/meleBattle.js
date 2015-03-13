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
        var atkF = this._getHighestMeleValue(this.attackers);
        var oppF = this._getHighestMeleValue(this.opponents);
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
        WarGame.UI.displayAlert(this.attackers[0].team.name + ' scores a hit.', WarGame.UI.ALERT_BAD);
        winner = this.attackers;
        loser = this.opponents;
        attacks = attackScores;
    } else {
        // TODO: highlight winners
        WarGame.UI.displayAlert(this.opponents[0].team.name + ' scores a hit.', WarGame.UI.ALERT_BAD);
        winner = this.opponents;
        loser = this.attackers;
        attacks = opponentScores;
    }

    /* jshint loopfunc: true */
    for (i=0; i<winner.length; i++) {
        var success = WarGame.WoundChart.tryWound(winner[i], loser[0]);
        if (success) {
            (function (player) {
                setTimeout(function () {
                    WarGame.UI.displayAlert(player.team.name + ' damaged his opponent.', WarGame.UI.ALERT_BAD);
                }, 500);
            })(winner[i]);
            // TODO: let winner pick who to wound
            loser[0].wound();
            if (loser[0].stats.wounds < 1) {
                loser.shift();
                if (loser.length < 1) {
                    break;
                }
            }
        } else {
            (function (player) {
                setTimeout(function () {
                    WarGame.UI.displayAlert(winner[0].team.name + ' caused no damage.', WarGame.UI.ALERT_INFO);
                }, 500);
            })(winner[i]);
        }
    }
};
