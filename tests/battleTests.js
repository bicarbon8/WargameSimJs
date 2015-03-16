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

QUnit.test('addAttacker will not add the same attacker more than once', function (assert) {
    expect(2);
    var b = new WarGame.Battle();
    assert.equal(b.getPlayers().length, 0, 'expected 0 players in battle');
    var p = new WarGame.Player();
    b.addAttacker(p);
    b.addAttacker(p);
    assert.equal(b.getPlayers().length, 1, 'expected 1 players in battle');
});

QUnit.test('addOpponent method increments the number of players', function (assert) {
    expect(2);
    var b = new WarGame.Battle();
    assert.equal(b.getPlayers().length, 0, 'expected 0 players in battle');
    b.addOpponent(new WarGame.Player());
    assert.equal(b.getPlayers().length, 1, 'expected 1 players in battle');
});

QUnit.test('addOpponent will not add the same opponent more than once', function (assert) {
    expect(2);
    var b = new WarGame.Battle();
    var p = new WarGame.Player();
    assert.equal(b.getPlayers().length, 0, 'expected 0 players in battle');
    b.addOpponent(p);
    b.addOpponent(p);
    assert.equal(b.getPlayers().length, 1, 'expected 1 players in battle');
});

QUnit.test('can add multiple attackers', function (assert) {
    expect(2);
    var b = new WarGame.Battle();
    assert.equal(b.getPlayers().length, 0, 'expected 0 players in battle');
    for (var i=0; i<3; i++) {
        b.addAttacker(new WarGame.Player());
    }
    assert.equal(b.getPlayers().length, 3, 'expected 3 players in battle');
});

QUnit.test('can add multiple opponents all at once', function (assert) {
    expect(2);
    var b = new WarGame.Battle();
    assert.equal(b.getPlayers().length, 0, 'expected 0 players in battle');
    var ps = [];
    for (var i=0; i<3; i++) {
        ps.push(new WarGame.Player());
    }
    b.addOpponents(ps);
    assert.equal(b.getPlayers().length, 3, 'expected 3 players in battle');
});

QUnit.test('can add and attacker and opponents', function (assert) {
    expect(2);
    var b = new WarGame.Battle();
    assert.equal(b.getPlayers().length, 0, 'expected 0 players in battle');
    b.addAttacker(new WarGame.Player());
    var ps = [];
    for (var i=0; i<3; i++) {
        ps.push(new WarGame.Player());
    }
    b.addOpponents(ps);
    assert.equal(b.getPlayers().length, 4, 'expected 4 players in battle');
});

QUnit.test('hasAttacker fails if player is opponent', function (assert) {
    expect(1);
    var b = new WarGame.Battle();
    var p = new WarGame.Player();
    b.addOpponent(p);
    assert.ok(!b.hasAttacker(p), 'expected no match for attacker');
});

QUnit.test('hasAttacker passes if player is attacker', function (assert) {
    expect(1);
    var b = new WarGame.Battle();
    var p = new WarGame.Player();
    b.addAttacker(p);
    assert.ok(b.hasAttacker(p), 'expected match for attacker');
});

QUnit.test('hasOpponent fails if player is attacker', function (assert) {
    expect(1);
    var b = new WarGame.Battle();
    var p = new WarGame.Player();
    b.addAttacker(p);
    assert.ok(!b.hasOpponent(p), 'expected no match for opponent');
});

QUnit.test('hasOpponent passes if player is opponent', function (assert) {
    expect(1);
    var b = new WarGame.Battle();
    var p = new WarGame.Player();
    b.addOpponent(p);
    assert.ok(b.hasOpponent(p), 'expected match for opponent');
});
