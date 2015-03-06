var WarGame = WarGame || {};
WarGame.Utils = {
    boardLocToCoordinates: function (boardLocation, grid) {
        var zLength = grid.length;
        var xLength = grid[0].length;
        var boardX = boardLocation.x;
        var boardZ = boardLocation.z;
        var boardY = boardLocation.y;
        var actualX = -(xLength / 2) + boardX;
        var actualZ = -(zLength / 2) + boardZ;
        var actualY = (boardY * WarGame.MapObjGenerator.STEP_OFFSET);

        return { x: actualX, y: actualY, z: actualZ };
    },

    coordinatesToBoardLoc: function (coordinates, grid) {
        var zLength = grid.length;
        var xLength = grid[0].length;
        var actualX = coordinates.x;
        var actualY = coordinates.y;
        var actualZ = coordinates.z;
        var boardX = (xLength / 2) + actualX;
        var boardY = actualY / WarGame.MapObjGenerator.STEP_OFFSET;
        var boardZ = (zLength / 2) + actualZ;

        return { x: boardX, y: boardY, z: boardZ };
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
    },

    getMouseIntersects: function (objArray) {
        var dims = WarGame.Plotter.getWidthHeight();
        var offset = WarGame.Plotter.renderer.domElement.getBoundingClientRect();
        WarGame.Plotter.mouse.x = ((event.clientX - offset.left) / dims.width) * 2 - 1;
        WarGame.Plotter.mouse.y = - ((event.clientY - offset.top) / dims.height) * 2 + 1;

        WarGame.Plotter.raycaster.setFromCamera(WarGame.Plotter.mouse, WarGame.Plotter.camera);
        var intersects = WarGame.Plotter.raycaster.intersectObjects(objArray);
        return intersects;
    },
};
