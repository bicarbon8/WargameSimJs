QUnit.module('WarGame.Player', {
    setup: function () {
        WarGame.map = new WarGame.Map(WarGame.Maps[0]);
    },
    teardown: function () {
        WarGame.map = null;
    }
});
QUnit.test('contsructor can be called with no arguments', function (assert) {
    expect(1);
    var p = new WarGame.Player();
    assert.ok(true, 'constructor called with no arguments');
});

QUnit.test('moveTo method moves BoardLocation', function (assert) {
    expect(2);
    var p = new WarGame.Player();
    assert.ok(p.boardLocation.equals(new WarGame.BoardLocation(-1, -1, -1)), 'expected to start at -1, -1, -1');
    var expected = new WarGame.BoardLocation(50, 0, 50);
    var coordinate = expected.toVector();
    p.moveTo(coordinate, true);
    assert.ok(p.boardLocation.equals(expected), 'expected to end at 50, 0, 50');
});

QUnit.test('wound method subtracts from wounds stat', function (assert) {
    expect(2);
    var p = new WarGame.Player();
    p.stats.wounds = 2;
    assert.equal(p.stats.wounds, 2, 'expected to have 2 wound points');
    p.wound();
    assert.equal(p.stats.wounds, 1, 'expected to have 1 wound remaining');
});
