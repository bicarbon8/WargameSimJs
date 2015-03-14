QUnit.module('WarGame.Map', {

});
QUnit.test('contstuctor can be called with no arguments', function (assert) {
    expect(1);
    var done = assert.async();
    var actual = new WarGame.Map();
    assert.ok(actual, 'map object created');
    done();
});

QUnit.test('can add a player at a location', function (assert) {
    expect(3);
    var done = assert.async();
    var m = new WarGame.Map(WarGame.Maps[0]);
    WarGame.map = m;
    assert.equal(m.getPlayers().length, 0, 'expected no players');
    var loc = new WarGame.BoardLocation(40, 0, 60);
    m.addPlayer(new WarGame.Player(), loc);
    assert.equal(m.getPlayers().length, 1, 'expected 1 player');
    assert.ok(loc.equals(m.getPlayers()[0].boardLocation), 'expected player at 40x60');
    done();
});

QUnit.test('can remove a player', function (assert) {
    expect(3);
    var done = assert.async();
    var m = new WarGame.Map(WarGame.Maps[0]);
    WarGame.map = m;
    assert.equal(m.getPlayers().length, 0, 'expected no players');
    var pl = new WarGame.Player();
    var loc = new WarGame.BoardLocation(40, 0, 60);
    m.addPlayer(pl, loc);
    assert.equal(m.getPlayers().length, 1, 'expected 1 player');
    m.removePlayer(pl);
    assert.equal(m.getPlayers().length, 0, 'expected no players');
    done();
});
