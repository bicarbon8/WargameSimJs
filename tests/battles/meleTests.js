QUnit.module('WarGame.Battles.Mele', {
    setup: function () {
        WarGame.initialize();
        WarGame.Maps.setCurrent('100x100');
    },
    teardown: function () {
        WarGame.reset();
    }
});
QUnit.test('getTotalAttackPoints adds all attacks for passed in player array', function (assert) {
    expect(1);
    var b = new WarGame.Battles.Mele();
    WarGame.addPlayer('basic', 0, new WarGame.Players.Location(50,0,50));
    WarGame.addPlayer('hero', 0, new WarGame.Players.Location(51,0,51));
    WarGame.addPlayer('basic', 0, new WarGame.Players.Location(52,0,52));
    assert.equal(b.getTotalAttackPoints(WarGame.Teams.get()[0].getPlayers()), 4, 'expected 4 points');
});

QUnit.test('getHighestMeleValue returns highest value player stat', function (assert) {
    expect(1);
    var b = new WarGame.Battles.Mele();
    WarGame.addPlayer('basic', 0, new WarGame.Players.Location(50,0,50));
    WarGame.addPlayer('hero', 0, new WarGame.Players.Location(51,0,51));
    WarGame.addPlayer('basic', 0, new WarGame.Players.Location(52,0,52));
    assert.equal(b.getHighestMeleValue(WarGame.Teams.get()[0].getPlayers()), 6, 'expected 6 points');
});
