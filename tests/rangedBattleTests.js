QUnit.module('WarGame.RangedBattle', {
    setup: function () {
        WarGame.initialize();
        WarGame.Maps.setCurrent('100x100');
    },
    teardown: function () {
        WarGame.reset();
    }
});
QUnit.test('addAttacker throws exception if called more than once', function (assert) {
    expect(2);
    var b = new WarGame.Battles.Ranged();
    assert.equal(b.getPlayers().length, 0, 'expected 0 players in battle');
    b.addAttacker(new WarGame.Players.Base());
    assert.throws(function () {
        b.addAttacker(new WarGame.Players.Base());
    }, 'expected exception adding 2nd attacker');
});
