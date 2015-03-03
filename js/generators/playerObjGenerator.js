var WarGame = WarGame || {};
WarGame.PlayerObjGenerator = {
    parse: function (json) {
        var playerObj = new THREE.Object3D();

        var bodyGeometry = new THREE.BoxGeometry(json.width, json.height, json.depth);
        var bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xffff00 });
        var body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.castShadow = true;
        body.position.y = 1.1;

        // var spriteTexture = THREE.ImageUtils.loadTexture('resources/sprites/sprite.png');
        // var spriteMaterial = new THREE.SpriteMaterial({ map: spriteTexture, useScreenCoordinates: true });
        // var sprite = new THREE.Sprite(spriteMaterial);
        // sprite.scale.set(64, 64, 1.0);
        // Plotter.scene.add(sprite);

        var baseGeometry = new THREE.CylinderGeometry(
            0.4, // top radius
            0.5, // bottom radius
            0.2, // length
            10,  // circle segments
            1,   // length segments
            false); // open
        var baseMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
        var base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.castShadow = true;
        base.position.y = 0.1;
        // base.rotateOnAxis(new THREE.Vector3(1, 0, 0), -(Math.PI / 2));

        playerObj.add(base);
        playerObj.add(body);

        return playerObj;
    }
};
