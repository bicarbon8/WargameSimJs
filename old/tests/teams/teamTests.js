QUnit.module('WarGame.Teams.Team', {
    setup: function () {
        WarGame.initialize();
        WarGame.Maps.setCurrent('100x100');
    },
    teardown: function () {
        WarGame.reset();
    }
});

var data = [
    { name: 'Sample', colour: 0x000000, points: 0, exception: 'team must start with more than 0 points' },
    { name: '', colour: 0xffffff, points: 1000, exception: 'name must be a non-empty string' },
    { name: 123456, colour: 0x808080, points: 1, exception: 'name must be a non-empty string' },
    { name: 'Sample', colour: 0x808080, points: -1, exception: 'team must start with more than 0 points' },
    { name: 'Sample', colour: 'foo', points: 1, exception: 'colour must be a valid hex number like: 0xa1b6ff' },
    { name: 'Sample', colour: 0x808080, points: 1, exception: null },
];
/* jshint loopfunc: true */
for (var i=0; i<data.length; i++) {
    (function(p) {

QUnit.test('can call constructor with name, colour and points: ' + JSON.stringify(p), function (assert) {
    if (p.exception) {
        expect(1);
        assert.throws(function () { new WarGame.Teams.Team(p.name, p.colour, p.points); });
    } else {
        expect(3);
        var t = new WarGame.Teams.Team(p.name, p.colour, p.points);
        assert.equal(t.getName(), p.name, 'expected name to match');
        assert.equal(t.getColour(), p.colour, 'expected colour to match');
        assert.equal(t.getRemainingPoints(), p.points, 'expected points to match');
    }
});

    })(data[i]);
}

QUnit.test('can add a player to a team', function (assert) {
    expect(3);
    var p = new WarGame.Players.createPlayer('basic');
    var t = new WarGame.Teams.Team('Test', 0xff0000, 100);
    t.addPlayer(p);
    var actual = t.getPlayers();
    assert.equal(actual.length, 1, 'expected 1 player');
    assert.equal(actual[0], p, 'expected player to match added player');
    assert.equal(t.getRemainingPoints(), 85, 'expected 15 points to be removed');
});

QUnit.test('can remove a player from a team', function (assert) {
    expect(3);
    var p = new WarGame.Players.createPlayer('basic');
    var t = new WarGame.Teams.Team('Test', 0xff0000, 100);
    t.addPlayer(p);
    var actual = t.getPlayers();
    assert.equal(actual.length, 1, 'expected 1 player');
    t.removePlayer(p);
    actual = t.getPlayers();
    assert.equal(actual.length, 0, 'expected 0 players');
    assert.equal(t.getRemainingPoints(), 85, 'expected 15 points to remain removed');
});

QUnit.test('can reset a team back to starting point', function (assert) {
    expect(2);
    var p = new WarGame.Players.createPlayer('basic');
    var t = new WarGame.Teams.Team('Test', 0xff0000, 100);
    t.addPlayer(p);
    t.reset();
    actual = t.getPlayers();
    assert.equal(actual.length, 0, 'expected 0 players');
    assert.equal(t.getRemainingPoints(), 100, 'expected points to be 100');
});
