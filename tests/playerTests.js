QUnit.module('WarGame.Player', {
    setup: function () {
        WarGame.map = new WarGame.Map(WarGame.Maps[0]);
    },
    teardown: function () {
        WarGame.map = null;
        WarGame.reset();
    }
});
QUnit.test('contsructor can be called with no arguments', function (assert) {
    var done = assert.async();
    expect(1);
    var p = new WarGame.Player();
    assert.ok(true, 'constructor called with no arguments');
    done();
});

QUnit.test('moveTo method moves BoardLocation', function (assert) {
    var done = assert.async();
    expect(2);
    var p = new WarGame.Player();
    assert.ok(p.boardLocation.equals(new WarGame.BoardLocation(-1, -1, -1)), 'expected to start at -1, -1, -1');
    var expected = new WarGame.BoardLocation(50, 0, 50);
    var coordinate = expected.toVector();
    p.moveTo(coordinate, true);
    assert.ok(p.boardLocation.equals(expected), 'expected to end at 50, 0, 50');
    done();
});

QUnit.test('wound method subtracts from wounds stat', function (assert) {
    var done = assert.async();
    expect(2);
    var p = new WarGame.Player();
    p.stats.wounds = 2;
    assert.equal(p.stats.wounds, 2, 'expected to have 2 wound points');
    p.wound();
    assert.equal(p.stats.wounds, 1, 'expected to have 1 wound remaining');
    done();
});

QUnit.test('player removed when wounds reaches 0', function (assert) {
    var done = assert.async();
    expect(3);
    var tmp = WarGame.onPlayerDefeated;
    WarGame.onPlayerDefeated = function (input) { assert.ok(true, 'onPlayerDefeated called'); };
    var p = new WarGame.Player();
    p.stats.wounds = 1;
    assert.equal(p.stats.wounds, 1, 'expected to have 1 wound points');
    p.wound();
    assert.equal(p.stats.wounds, 0, 'expected to have 0 wounds remaining');
    WarGame.onPlayerDefeated = tmp;
    done();
});

/**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Integration tests
 */
QUnit.test('isBattling method is false when no opponents nearby', function (assert) {
    var done = assert.async();
    expect(1);
    WarGame.addPlayer('basic', 0, { x: 50, z: 50 });

    for (var z=48; z<=52; z++) {
        for (var x=48; x<=52; x++) {
            if ((z<49 || z>51) && (x<49 || x>51)) {
                WarGame.addPlayer('basic', 1, { x: x, z: z });
            }
        }
    }

    var p = WarGame.teams[0].players[0];
    assert.ok(!p.isBattling(), 'expected to not be battling');
    done();
});

/* jshint loopfunc: true */
for (var z=49; z<=51; z++) {
    for (var x=49; x<=51; x++) {
        if (!(z === 50 && x === 50)) {
            (function (loc) {

QUnit.test('isBattling method is false when team nearby: ' + JSON.stringify(loc), function (assert) {
    var done = assert.async();
    expect(1);
    WarGame.addPlayer('basic', 0, { x: 50, z: 50 });
    WarGame.addPlayer('basic', 0, { x: loc.x, z: loc.z });

    var p = WarGame.teams[0].players[0];
    assert.ok(!p.isBattling(), 'expected to not be battling');
    done();
});

QUnit.test('isBattling method is true when opponents nearby: ' + JSON.stringify(loc), function (assert) {
    var done = assert.async();
    expect(1);
    WarGame.addPlayer('basic', 0, { x: 50, z: 50 });
    WarGame.addPlayer('basic', 1, { x: loc.x, z: loc.z });

    var p = WarGame.teams[0].players[0];
    assert.ok(p.isBattling(), 'expected to be battling');
    done();
});

            })({ x: x, z: z });
        }
    }
}
