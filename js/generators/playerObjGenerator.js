var WarGame = WarGame || {};
WarGame.PlayerObjGenerator = {
    parse: function (json) {
        var playerObj = new THREE.Object3D();

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
        var baseMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
        var base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.castShadow = true;
        base.position.y = 0.1;
        // base.rotateOnAxis(new THREE.Vector3(1, 0, 0), -(Math.PI / 2));

        var bodyGeometry = new THREE.CylinderGeometry(
            json.width / 2, // top radius
            0.1, // bottom radius
            json.height, // length
            10,  // circle segments
            1,   // length segments
            false); // open
        var bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
        var body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.castShadow = true;
        body.position.y = (json.height / 2) + 0.1;

        var headRadius = (json.width / 2) - 0.1;
        var headGeometry = new THREE.SphereGeometry(
            headRadius, // radius
            10,  // width segments
            10); // height segments
        var headMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
        var head = new THREE.Mesh(headGeometry, headMaterial);
        head.castShadow = true;
        head.position.y = (json.height / 2) + 0.1 + ((json.height / 2) + (json.width / 2));

        playerObj.add(base);
        playerObj.add(body);
        playerObj.add(head);

        return playerObj;
    }
};
