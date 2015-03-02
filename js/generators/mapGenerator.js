var MapGenerator = {
    parse: function (json) {
        var mapGeometry = new THREE.Geometry();
        var matrix = new THREE.Matrix4();

        var startX = -(json.grid.length / 2);
        var startZ;
        for (var i=0; i<json.grid.length; i++) {
            var gridRow = json.grid[i];
            startZ = -(gridRow.length / 2);
            for (var j=0; j<gridRow.length; j++) {
                var boxGeometry = new THREE.BoxGeometry(1, 1, 1);
                matrix.makeTranslation(
                    startX + i,
                    -0.5 + (gridRow[j] * 0.5),
                    (startZ + j) * -1
                );
                mapGeometry.merge(boxGeometry, matrix);
            }
        }

        var mapMaterial = new THREE.MeshLambertMaterial({ color: 0x44ff44 });
        var map = new THREE.Mesh(mapGeometry, mapMaterial);
        map.receiveShadow = true;
        map.castShadow = true;

        return map;
    }
};
