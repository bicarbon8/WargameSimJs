var WarGame = WarGame || {};
WarGame.Utils = {
    translateCoordinates: function (boardLocation, map) {
        var zLength = map.attributes.grid.length;
        var xLength = map.attributes.grid[0].length;
        var boardX = boardLocation.x;
        var boardZ = boardLocation.z;
        var boardY = boardLocation.y;
        var actualX = -(xLength / 2) + boardX;
        var actualZ = (zLength / 2) - boardZ;
        var actualY = (boardY * WarGame.MapObjGenerator.STEP_OFFSET);

        return { x: actualX, y: actualY, z: actualZ };
    },

    diceRoll: function (numDice, sides) {
        var times = numDice || 1;
        var s = sides || 6;
        var results = [];
        for (var i=0; i<times; i++) {
            results.push(WarGame.Utils.getRandomInt(1, s));
        }

        return results;
    },

    getRandomInt: function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
};
