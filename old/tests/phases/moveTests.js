WarGame.Phases.Move.TestTemp = [];
QUnit.module('WarGame.Phases.Move', {
    setup: function () {
        WarGame.initialize();
        WarGame.Maps.setCurrent('100x100');

        WarGame.Phases.Move.TestTemp.push(WarGame.UI.Plotter.addListener);
        WarGame.Phases.Move.TestTemp.push(WarGame.UI.Plotter.removeListener);
    },
    teardown: function () {
        WarGame.UI.Plotter.addListener = WarGame.Phases.Move.TestTemp[0];
        WarGame.UI.Plotter.removeListener = WarGame.Phases.Move.TestTemp[1];
        WarGame.Phases.Move.TestTemp = [];
        WarGame.reset();
    }
});

QUnit.test('calling start adds a mousemove and click listener', function (assert) {
    expect(2);
    WarGame.UI.Plotter.addListener = function (type, fn) {
        assert.ok(type === 'mousemove' || type === 'click', 'expected mousemove or click listener');
    };

    WarGame.Phases.Move.start();
});

QUnit.test('calling end removes a mousemove and click listener and moves to next phase', function (assert) {
    expect(3);

    var foo = WarGame.Phases.next;
    WarGame.Phases.next = function () { assert.ok(true, 'expected next to be called'); };
    WarGame.UI.Plotter.removeListener = function (type, fn) {
        assert.ok(type === 'mousemove' || type === 'click', 'expected mousemove or click listener');
    };
    WarGame.Phases.Move.end();

    WarGame.Phases.next = foo;
});

QUnit.test('calling endTurn moves to next team', function (assert) {
    expect(1);

    var original = WarGame.Teams.getCurrent();
    WarGame.Phases.Move.endTurn();
    var actual = WarGame.Teams.getCurrent();
    assert.notEqual(actual, original, 'expected teams to not match');
});

QUnit.test('calling endTurn for all teams calls end', function (assert) {
    expect(1);

    var foo = WarGame.Phases.Move.end;
    WarGame.Phases.Move.end = function () { assert.ok(true, 'expected call to end'); };

    var length = WarGame.Teams.get().length;
    while (length) {
        WarGame.Phases.Move.endTurn();
        length--;
    }
});

QUnit.test('calling movePlayer will call the movePlayerTo method of the current map', function (assert) {
    expect(4);

    // setup a player
    var p = new WarGame.Players.createPlayer('basic', WarGame.Teams.getCurrent());
    WarGame.Teams.getCurrent().addPlayer(p);

    var map = WarGame.Maps.getCurrent();
    var foo = map.movePlayerTo;
    map.movePlayerTo = function (player, location) {
        assert.ok(true, 'expected movePlayerTo to be called');
        assert.equal(location.x, 1, 'expected location at x=1');
        assert.equal(location.y, 0, 'expected location at y=0');
        assert.equal(location.z, 1, 'expected location at z=1');
    };
    var bar = WarGame.UI.getValue;
    WarGame.UI.getValue = function () { return '1'; };

    // call under test
    WarGame.Phases.Move.movePlayer(WarGame.Teams.getCurrent().name, p.id);

    WarGame.UI.getValue = bar;
    map.movePlayerTo = foo;
});
