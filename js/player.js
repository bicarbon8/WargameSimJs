var WarGame = WarGame || {};
WarGame.Player = function (obj, team, attributes) {
    this.obj = obj;
    this.team = team;
    this.attributes = attributes;
    this.boardLocation = null;

    this.initialize();
};

WarGame.Player.prototype.initialize = function () {
    this.setColour(this.team.colour);
};

WarGame.Player.prototype.setColour = function (colour) {
    this.obj.material.color.setHex(colour);
};

WarGame.Player.prototype.moveTo = function (coordinates) {
    this.obj.position.set(coordinates.x,coordinates.y,coordinates.z);
};

WarGame.Player.prototype.battle = function (opponent) {
    var attackScores = WarGame.Utils.diceRoll(this.attributes.stats.attacks);
    var opponentScores = WarGame.Utils.diceRoll(opponent.attributes.stats.attacks);
    var i, myTopScore = 0;
    for (i=0; i<attackScores.length; i++) {
        if (attackScores[i] > myTopScore) {
            myTopScore = attackScores[i];
        }
    }
    var oppTopScore = 0;
    for (i=0; i<opponentScores.length; i++)     {
        if (opponentScores[i] > oppTopScore) {
            oppTopScore = opponentScores[i];
        }
    }
    // handle a tie
    if (myTopScore === oppTopScore) {
        // reroll to decide winner
        var roll = WarGame.Utils.diceRoll()[0];
        if (roll > 3) {
            myTopScore++;
        } else {
            oppTopScore++;
        }
    }
    // TODO: move loser back 1 space or handle trapped condition
    var winner, loser;
    if (myTopScore > oppTopScore) {
        alert(this.team.name + ' wins the attack.');
        winner = this;
        loser = opponent;
    } else {
        alert(opponent.team.name + ' wins the attack.');
        winner = opponent;
        loser = this;
    }
    for (i=0; i<winner.attributes.stats.attacks; i++) {
        var success = WarGame.WoundChart.tryWound(winner, loser);
        if (success) {
            alert(winner.team.name + ' scored a hit.');
            loser.wound();
        } else {
            alert(winner.team.name + ' missed.');
        }
    }
};

WarGame.Player.prototype.wound = function () {
    this.attributes.stats.wounds--;
    if (this.attributes.stats.wounds < 1) {
        // you are dead
        alert("Team: " + this.team.name + " player defeated!");
        WarGame.removePlayer(this);
    }
};
