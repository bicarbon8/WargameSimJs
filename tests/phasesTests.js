WarGame.Phases.TestTemp = [];
QUnit.module('WarGame.Phases', {
    setup: function () {
        WarGame.initialize();
        WarGame.Maps.setCurrent('100x100');

        WarGame.Phases.TestTemp.push(WarGame.Phases.Priority.start);
        WarGame.Phases.TestTemp.push(WarGame.Phases.Move.start);
        WarGame.Phases.TestTemp.push(WarGame.Phases.Shoot.start);
        WarGame.Phases.TestTemp.push(WarGame.Phases.Fight.start);
    },
    teardown: function () {
        WarGame.reset();

        WarGame.Phases.Priority.start = WarGame.Phases.TestTemp[0];
        WarGame.Phases.Move.start = WarGame.Phases.TestTemp[1];
        WarGame.Phases.Shoot.start = WarGame.Phases.TestTemp[2];
        WarGame.Phases.Fight.start = WarGame.Phases.TestTemp[3];

        WarGame.Phases.TestTemp = [];
    }
});

QUnit.test('calling doCurrent will execute the start method for the current phase', function (assert) {
    expect(4);

    WarGame.Phases.Priority.start = function () { assert.ok(true, 'expected WarGame.Phases.Priority.start'); };
    WarGame.Phases.Move.start = function () { assert.ok(true, 'expected WarGame.Phases.Move.start'); };
    WarGame.Phases.Shoot.start = function () { assert.ok(true, 'expected WarGame.Phases.Shoot.start'); };
    WarGame.Phases.Fight.start = function () { assert.ok(true, 'expected WarGame.Phases.Fight.start'); };

    var phase = 0;
    while (phase < 4) {
        WarGame.Phases.CURRENT = phase;
        WarGame.Phases.doCurrent();
        phase++;
    }
});

QUnit.test('calling next will execute the start method of the next phase', function (assert) {
    expect(4);
    var num = 0;
    WarGame.Phases.Priority.start = function () { assert.ok(num === 3, 'expected WarGame.Phases.Priority.start called last'); };
    WarGame.Phases.Move.start = function () { assert.ok(num === 0, 'expected WarGame.Phases.Move.start called third'); };
    WarGame.Phases.Shoot.start = function () { assert.ok(num === 1, 'expected WarGame.Phases.Shoot.start called second'); };
    WarGame.Phases.Fight.start = function () { assert.ok(num === 2, 'expected WarGame.Phases.Fight.start called first'); };

    while (num < 4) {
        WarGame.Phases.next();
        num++;
    }
});

QUnit.test('current phase name can be returned', function (assert) {
    expect(4);

    WarGame.Phases.Priority.start = function () { assert.equal(WarGame.Phases.getCurrentPhaseName(), 'PRIORITY'); };
    WarGame.Phases.Move.start = function () { assert.equal(WarGame.Phases.getCurrentPhaseName(), 'MOVEMENT'); };
    WarGame.Phases.Shoot.start = function () { assert.equal(WarGame.Phases.getCurrentPhaseName(), 'SHOOTING'); };
    WarGame.Phases.Fight.start = function () { assert.equal(WarGame.Phases.getCurrentPhaseName(), 'FIGHTING'); };

    var phase = 0;
    while (phase < 4) {
        WarGame.Phases.CURRENT = phase;
        WarGame.Phases.doCurrent();
        phase++;
    }
});
