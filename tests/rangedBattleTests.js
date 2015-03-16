QUnit.module('WarGame.RangedBattle', {
    setup: function () {
        WarGame.map = new WarGame.Map(WarGame.Maps[0]);
    },
    teardown: function () {
        WarGame.map = null;
    }
});
QUnit.test('addAttacker throws exception if called more than once', function (assert) {
    expect(2);
    var b = new WarGame.RangedBattle();
    assert.equal(b.getPlayers().length, 0, 'expected 0 players in battle');
    b.addAttacker(new WarGame.Player());
    assert.throws(function () {
        b.addAttacker(new WarGame.Player());
    }, 'expected exception adding 2nd attacker');
});
