var tmp = [];
QUnit.module('WarGame.Phases.Priority', {
    setup: function () {
        WarGame.initialize();
        WarGame.Maps.setCurrent('100x100');
    },
    teardown: function () {
        WarGame.reset();
    }
});

QUnit.test('calling start will determine a random team has priority', function (assert) {
    expect(103);
    var foo = WarGame.UI.setCurrentTeamText;
    WarGame.UI.setCurrentTeamText = function () { assert.ok(true, 'expected WarGame.UI.setCurrentTeamText to be called'); };
    tmp.push(WarGame.Phases.next);
    WarGame.Phases.next = function () {};

    var teamResults = [0, 0];
    for (var i=0; i<100; i++) {
        WarGame.Phases.Priority.start();
        var index = WarGame.Teams.getTeamIndexByName(WarGame.Teams.getPriority().name);
        teamResults[index]++;
    }
    assert.equal(teamResults[0] + teamResults[1], 100, 'expected 100 results');
    assert.ok(teamResults[0] > 10, 'expected at least 10 results for team 0');
    assert.ok(teamResults[1] > 10, 'expected at least 10 results for team 1');

    WarGame.UI.setCurrentTeamText = foo;
    WarGame.Phases.next = tmp[0];
    tmp = [];
});

QUnit.test('calling start will call end when done', function (assert) {
    tmp.push(WarGame.Phases.next);
    WarGame.Phases.next = function () { assert.ok(true, 'expected WarGame.Phases.next to be called'); };

    WarGame.Phases.Priority.start();

    WarGame.Phases.next = tmp[0];
    tmp = [];
});
