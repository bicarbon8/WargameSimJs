var WarGame = WarGame || {};
WarGame.PlayerObjGenerator = {
    parse: function (json) {
        var playerGeometry = new THREE.Geometry();
        var matrix = new THREE.Matrix4();

        // base
        var geometry = new THREE.CylinderGeometry(
            0.4, // top radius
            0.5, // bottom radius
            0.2, // length
            4,  // circle segments
            1,   // length segments
            false); // open
        matrix.makeTranslation(0, 0.1, 0);
        playerGeometry.merge(geometry, matrix);

        // body
        geometry = new THREE.CylinderGeometry(
            json.width / 2, // top radius
            0.1, // bottom radius
            json.height, // length
            6,  // circle segments
            1,   // length segments
            false); // open
        matrix.makeTranslation(0, (json.height / 2) + 0.1, 0);
        playerGeometry.merge(geometry, matrix);

        // head
        var headRadius = (json.width / 2) - 0.1;
        geometry = new THREE.SphereGeometry(
            headRadius, // radius
            6,  // width segments
            6); // height segments
        matrix.makeTranslation(0, (json.height / 2) + 0.1 + ((json.height / 2) + (json.width / 2)), 0);
        playerGeometry.merge(geometry, matrix);

        var playerMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 }); // gray (set later)
        var playerObj = new THREE.Mesh(playerGeometry, playerMaterial);
        playerObj.castShadow = true;

        return playerObj;
    }
};
