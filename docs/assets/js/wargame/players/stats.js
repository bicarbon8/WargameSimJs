var WarGame = WarGame || {};
WarGame.Players = WarGame.Players || {};
WarGame.Players.Stats = function () {
    this.mele = 0;
    this.ranged = 0;
    this.strength = 0;
    this.defense = 0;
    this.attacks = 0;
    this.wounds = 0;
    this.courage = 0;
    this.might = 0;
    this.will = 0;
    this.fate = 0;
};

WarGame.Players.Stats.prototype.initialize = function (mele, ranged, strength, defense, attacks, wounds, courage, might, will, fate) {
    this.mele = mele;
    this.ranged = ranged;
    this.strength = strength;
    this.defense = defense;
    this.attacks = attacks;
    this.wounds = wounds;
    this.courage = courage;
    this.might = might;
    this.will = will;
    this.fate = fate;
};

WarGame.Players.Stats.prototype.parse = function (json) {
    this.mele = json.mele;
    this.ranged = json.ranged;
    this.strength = json.strength;
    this.defense = json.defense;
    this.attacks = json.attacks;
    this.wounds = json.wounds;
    this.courage = json.courage;
    this.might = json.might;
    this.will = json.will;
    this.fate = json.fate;
};

WarGame.Players.Stats.prototype.toString = function () {
    return 'F: ' + this.mele + '/' + this.ranged + '+, ' +
        'S: ' + this.strength + ', ' +
        'D: ' + this.defense + ', ' +
        'A: ' + this.attacks + ', ' +
        'W: ' + this.wounds + ', ' +
        'C: ' + this.courage + ', ' +
        'Might: ' + this.might + ', ' +
        'Will: ' + this.will + ', ' +
        'Fate: ' + this.fate + ', ';
};
