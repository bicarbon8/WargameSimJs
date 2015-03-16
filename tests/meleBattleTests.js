QUnit.module('WarGame.MeleBattle', {
    setup: function () {
        WarGame.map = new WarGame.Map(WarGame.Maps[0]);
    },
    teardown: function () {
        WarGame.map = null;
    }
});
QUnit.test('getTotalAttackPoints adds all attacks for passed in player array', function (assert) {
    expect(1);
    var b = new WarGame.MeleBattle();
    var basic = WarGame.Players.filter(function (p) {
        return p.name.toLowerCase() === 'basic'; // basic has 1
    })[0];
    var hero = WarGame.Players.filter(function (p) {
        return p.name.toLowerCase() === 'hero'; // hero has 2
    })[0];
    var ps = [];
    ps.push(new WarGame.Player(WarGame.teams[0], basic));
    ps.push(new WarGame.Player(WarGame.teams[0], hero));
    ps.push(new WarGame.Player(WarGame.teams[0], basic));
    assert.equal(b.getTotalAttackPoints(ps), 4, 'expected 4 points');
});

QUnit.test('getHighestMeleValue returns highest value player stat', function (assert) {
    expect(1);
    var b = new WarGame.MeleBattle();
    var basic = WarGame.Players.filter(function (p) {
        return p.name.toLowerCase() === 'basic'; // basic has 3
    })[0];
    var hero = WarGame.Players.filter(function (p) {
        return p.name.toLowerCase() === 'hero'; // hero has 6
    })[0];
    var ps = [];
    ps.push(new WarGame.Player(WarGame.teams[0], basic));
    ps.push(new WarGame.Player(WarGame.teams[0], hero));
    ps.push(new WarGame.Player(WarGame.teams[0], basic));
    assert.equal(b.getHighestMeleValue(ps), 6, 'expected 6 points');
});
