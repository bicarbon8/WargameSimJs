var WarGame = WarGame || {};
WarGame.Maps = {};

WarGame.Maps.MAX_BLOCK_HEIGHT = 5;
WarGame.Maps.STEP_OFFSET = 0.5;
WarGame.Maps.CURRENT = null;
WarGame.Maps._array = [];

WarGame.Maps.add = function (mapAttributes) {
    WarGame.Maps._array.push(mapAttributes);
};

WarGame.Maps.get = function () {
    return WarGame.Maps._array;
};

WarGame.Maps.getMapAttributesByName = function (name) {
    var maps = WarGame.Maps.get();
    for (var i=0; i<maps.length; i++) {
        if (maps[i].name.toLowerCase() === name.toLowerCase()) {
            return maps[i];
        }
    }

    throw "unable to locate map with name: " + name;
};

WarGame.Maps.getCurrent = function () {
    return WarGame.Maps.CURRENT;
};

WarGame.Maps.setCurrent = function (name) {
    var attr = WarGame.Maps.getMapAttributesByName(name);
    WarGame.Maps.CURRENT = new WarGame.Maps.Base(attr);
    return WarGame.Maps.getCurrent();
};

WarGame.Maps.reset = function () {
    WarGame.Maps.CURRENT = null;
};
