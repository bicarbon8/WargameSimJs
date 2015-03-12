QUnit.module('WarGame.Battle', {
    setup: function () {
        WarGame.map = new WarGame.Map(WarGame.Maps[0]);
    },
    teardown: function () {
        WarGame.map = null;
    }
});
QUnit.test('generic battle class can be created', function(assert) {
    expect(1);
    var b = new WarGame.Battle();
    assert.ok(true, 'WarGame.Battle class can be created');
});

QUnit.test('generic battle class throws exception when started', function(assert) {
    expect(1);
    var b = new WarGame.Battle();
    assert.throws(function () { b.start(); }, /abstract base method cannot be called. please use concrete class./);
});

QUnit.test('addAttacker method increments the number of players', function (assert) {
    expect(2);
    var b = new WarGame.Battle();
    assert.equal(b.getPlayers().length, 0, 'expected 0 players in battle');
    b.addAttacker(new WarGame.Player());
    assert.equal(b.getPlayers().length, 1, 'expected 1 players in battle');
});

QUnit.test('addOpponent method increments the number of players', function (assert) {
    expect(2);
    var b = new WarGame.Battle();
    assert.equal(b.getPlayers().length, 0, 'expected 0 players in battle');
    b.addOpponent(new WarGame.Player());
    assert.equal(b.getPlayers().length, 1, 'expected 1 players in battle');
});
