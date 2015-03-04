var WarGame = WarGame || {};
WarGame.Map = function (obj, attributes) {
    this.obj = obj;
    this.attributes = attributes;
    this.players = [];
};

WarGame.Map.prototype.addPlayer = function(player, location) {
    var coordinates = WarGame.Utils.translateCoordinates({ x: location.x, y: location.y, z: location.z }, this);
    player.moveTo(coordinates);
    this.players.push(player);
    WarGame.Plotter.scene.add(player.obj);
};
