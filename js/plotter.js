var WarGame = WarGame || {};
WarGame.Plotter = {
    scene: null,
    camera: null,
    lights: null,
    renderer: null,
    field: null,
    timeStep: 0.00001,
    raycaster: null,
    mouse: null,

    initialize: function () {
        WarGame.Plotter.field = document.querySelector('#playfield');
        var dims = WarGame.Plotter.getWidthHeight();

        WarGame.Plotter.scene = new THREE.Scene();
        WarGame.Plotter.scene.fog = new THREE.FogExp2(0xffffff, 0.015);

        WarGame.Plotter.camera = new THREE.PerspectiveCamera(45, dims.width / dims.height, 0.1, 100000);
        WarGame.Plotter.camera.position.set(0, 50, 50);
        WarGame.Plotter.camera.lookAt(WarGame.Plotter.scene.position);

        WarGame.Plotter.lights = new THREE.Object3D();
        for (var i=-20; i<30; i+=40) {
            for (var j=-20; j<30; j+=40) {
                var sunLight = new THREE.PointLight(0xFFFF44, 0.2, 0, Math.PI / 2, 1); // orange light
                sunLight.position.set(i, 600, j);

                var moonLight = new THREE.PointLight(0x3333FF, 0.25, 0, Math.PI / 2, 1); // blue light
                moonLight.position.set(i, -600, j);

                WarGame.Plotter.lights.add(sunLight);
                WarGame.Plotter.lights.add(moonLight);
            }
        }
        var sunShadowLight = new THREE.SpotLight(0xFFFF44, 0.2, 0, Math.PI / 2, 1);
        sunShadowLight.castShadow = true;
        sunShadowLight.shadowCameraNear = 100;
        sunShadowLight.shadowCameraFar = 1100;
        // sunShadowLight.shadowCameraVisible = true;
        sunShadowLight.shadowBias = 0.0001;
        sunShadowLight.shadowDarkness = 0.75;
        sunShadowLight.shadowMapWidth = 2048;
        sunShadowLight.shadowMapHeight = 2048;
        sunShadowLight.position.set(0, 600, 0);
        WarGame.Plotter.lights.add(sunShadowLight);

        var ambientLight = new THREE.AmbientLight(0x606060); // soft white light

        var waterGeometry = new THREE.PlaneBufferGeometry(10000, 10000, 1, 1);
        var waterMaterial = new THREE.MeshLambertMaterial({ color: 0x0000ff });
        var water = new THREE.Mesh(waterGeometry, waterMaterial);
        water.position.y -= 0.5;
        water.rotation.x -= Math.PI / 2;

        var skyboxGeometry = new THREE.BoxGeometry(10000, 10000, 10000);
        var skyboxMaterial = new THREE.MeshBasicMaterial({ color: 0x9999ff, side: THREE.DoubleSide });
        var skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);

        WarGame.Plotter.renderer = new THREE.WebGLRenderer();
        WarGame.Plotter.renderer.setSize(dims.width, dims.height);
        WarGame.Plotter.renderer.shadowMapEnabled = true;

        WarGame.Plotter.controls = new THREE.OrbitControls(WarGame.Plotter.camera, WarGame.Plotter.renderer.domElement);
        WarGame.Plotter.controls.addEventListener('change', function () { WarGame.Plotter.render(); });
        // WarGame.Plotter.controls.minDistance = 20;
        // WarGame.Plotter.controls.maxDistance = 1000;
        // WarGame.Plotter.controls.minPolarAngle = Math.PI / 2;
        // WarGame.Plotter.controls.maxPolarAngle = Math.PI - (Math.PI * 0.1);
        // WarGame.Plotter.controls.minAzimuthAngle = -Math.PI / 2 + (Math.PI * 0.1);
        // WarGame.Plotter.controls.maxAzimuthAngle = Math.PI / 2 - (Math.PI * 0.1);

        WarGame.Plotter.field.appendChild(WarGame.Plotter.renderer.domElement);

        WarGame.Plotter.scene.add(WarGame.Plotter.lights);
        WarGame.Plotter.scene.add(WarGame.Plotter.camera);
        WarGame.Plotter.scene.add(ambientLight);
        WarGame.Plotter.scene.add(skybox);
        WarGame.Plotter.scene.add(water);

        // var axisHelper = new THREE.AxisHelper(50);
        // WarGame.Plotter.scene.add(axisHelper);

        WarGame.Plotter.render();

        WarGame.Plotter.raycaster = new THREE.Raycaster();
        WarGame.Plotter.mouse = new THREE.Vector2();

        window.addEventListener('resize', WarGame.Plotter.resize, false);
    },

    getWidthHeight: function () {
        return { width: WarGame.Plotter.field.offsetWidth, height: WarGame.Plotter.field.offsetHeight };
    },

    resize: function () {
        var dims = WarGame.Plotter.getWidthHeight();
        try {
            WarGame.Plotter.camera.aspect = dims.width / dims.height;
            WarGame.Plotter.camera.updateProjectionMatrix();
            WarGame.Plotter.renderer.setSize(dims.width, dims.height);
            WarGame.Plotter.controls.handleResize();
        } catch (e) {
            // TODO: log
        }
    },

    render: function () {
        // WarGame.Plotter.lights.rotateOnAxis(new THREE.Vector3(1,0,0), WarGame.Plotter.timeStep);
        WarGame.Plotter.lights.rotation.z += WarGame.Plotter.timeStep;
        if (WarGame.Plotter.lights.rotation.z > 6.27) {
            WarGame.Plotter.lights.rotation.z = 0;
        }
        WarGame.Plotter.renderer.render(WarGame.Plotter.scene, WarGame.Plotter.camera);
    },

    reset: function () {
        WarGame.Plotter.field.removeChild(WarGame.Plotter.renderer.domElement);
        WarGame.Plotter.scene = null;
        WarGame.Plotter.camera = null;
        WarGame.Plotter.lights = null;
        WarGame.Plotter.renderer = null;
        WarGame.Plotter.field = null;
        WarGame.Plotter.initialize();
    },

    addMesh: function (mesh) {
        WarGame.Plotter.scene.add(mesh);
    },

    removeMesh: function (mesh) {
        WarGame.Plotter.scene.remove(mesh);
    }
};
