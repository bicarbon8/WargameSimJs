var WarGame = WarGame || {};
WarGame.RangedBattle = function () {
    WarGame.Battle.call(this);

    this.attacksRemaining = 0;
};
WarGame.RangedBattle.prototype = Object.create(WarGame.Battle.prototype);
WarGame.RangedBattle.prototype.constructor = WarGame.RangedBattle;

WarGame.RangedBattle.prototype.addAttacker = function (player) {
    if (this.attackers.length === 0) {
        this.attacksRemaining = player.stats.attacks;
        this._addPlayerTo(player, this.attackers);
    } else {
        throw 'cannot add more than one attacker to a ranged battle.';
    }
};

WarGame.RangedBattle.prototype.start = function () {
    var roll = WarGame.Utils.diceRoll();
    if (roll >= this.attackers[0].stats.ranged) {
        alert(this.attackers[0].team.name + ' scored a hit.');
        var success = WarGame.WoundChart.tryWound(this.attackers[0], this.opponents[0]);
        if (success) {
            alert(this.attackers[0].team.name + ' damaged his opponent.');
            // TODO: let winner pick who to wound
            this.opponents[0].wound();
        } else {
            alert(this.attackers[0].team.name + ' caused no damage.');
        }
    } else {
        alert(this.attackers[0].team.name + ' missed.');
    }
};
