var WarGame = WarGame || {};
WarGame.MapObjGenerator = {
    STEP_OFFSET: 0.5,
    MAX_BLOCK_HEIGHT: 5,
    parse: function (json) {
        var mapGeometry = new THREE.Geometry();
        var matrix = new THREE.Matrix4();

        for (var z=0; z<json.grid.length; z++) {
            for (var x=0; x<json.grid[z].length; x++) {
                var boxGeometry = new THREE.BoxGeometry(1, WarGame.MapObjGenerator.MAX_BLOCK_HEIGHT, 1);
                var y = -(WarGame.MapObjGenerator.MAX_BLOCK_HEIGHT) + json.grid[z][x];
                var coordinates = WarGame.Utils.boardLocToCoordinates(new THREE.Vector3(x,y,z), json.grid);
                matrix.makeTranslation(
                    coordinates.x,
                    coordinates.y,
                    coordinates.z
                );
                mapGeometry.merge(boxGeometry, matrix);
            }
        }

        var mapMaterial = new THREE.MeshLambertMaterial({
            color: 0x44ff44,
            // wireframe: true
        });
        var mapObj = new THREE.Mesh(mapGeometry, mapMaterial);
        mapObj.receiveShadow = true;
        mapObj.castShadow = true;

        return mapObj;
    }
};
