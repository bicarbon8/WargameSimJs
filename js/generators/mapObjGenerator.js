var WarGame = WarGame || {};
WarGame.MapObjGenerator = {
    STEP_OFFSET: 0.5,
    MAX_BLOCK_HEIGHT: 5,
    parse: function (json) {
        var mapGeometry = new THREE.Geometry();
        var matrix = new THREE.Matrix4();

        var startX = -(json.grid.length / 2);
        var startZ;
        for (var i=0; i<json.grid.length; i++) {
            var gridRow = json.grid[i];
            startZ = -(gridRow.length / 2);
            for (var j=0; j<gridRow.length; j++) {
                var boxGeometry = new THREE.BoxGeometry(1, WarGame.MapObjGenerator.MAX_BLOCK_HEIGHT, 1);
                matrix.makeTranslation(
                    startX + i,
                    -(WarGame.MapObjGenerator.MAX_BLOCK_HEIGHT / 2) + (gridRow[j] * WarGame.MapObjGenerator.STEP_OFFSET),
                    (startZ + j) * -1
                );
                mapGeometry.merge(boxGeometry, matrix);
            }
        }

        var mapMaterial = new THREE.MeshLambertMaterial({ color: 0x44ff44 });
        var mapObj = new THREE.Mesh(mapGeometry, mapMaterial);
        mapObj.receiveShadow = true;
        mapObj.castShadow = true;

        return mapObj;
    }
};
