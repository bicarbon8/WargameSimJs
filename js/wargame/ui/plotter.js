var WarGame = WarGame || {};
WarGame.UI = WarGame.UI || {};
WarGame.UI.Plotter = {
    scene: null,
    camera: null,
    lights: null,
    renderer: null,
    field: null,
    timeStep: 0.00001,
    raycaster: null,
    mouse: null,

    initialize: function () {
        var dims = WarGame.UI.Plotter.getWidthHeight();

        WarGame.UI.Plotter.scene = new THREE.Scene();
        WarGame.UI.Plotter.scene.fog = new THREE.FogExp2(0xffffff, 0.015);

        WarGame.UI.Plotter.camera = new THREE.PerspectiveCamera(45, dims.width / dims.height, 0.1, 100000);
        WarGame.UI.Plotter.camera.position.set(0, 50, 50);
        WarGame.UI.Plotter.camera.lookAt(WarGame.UI.Plotter.scene.position);

        WarGame.UI.Plotter.lights = new THREE.Object3D();
        for (var i=-20; i<30; i+=40) {
            for (var j=-20; j<30; j+=40) {
                var sunLight = new THREE.PointLight(0xFFFF44, 0.2, 0, Math.PI / 2, 1); // orange light
                sunLight.position.set(i, 600, j);

                var moonLight = new THREE.PointLight(0x3333FF, 0.25, 0, Math.PI / 2, 1); // blue light
                moonLight.position.set(i, -600, j);

                WarGame.UI.Plotter.lights.add(sunLight);
                WarGame.UI.Plotter.lights.add(moonLight);
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
        WarGame.UI.Plotter.lights.add(sunShadowLight);

        var ambientLight = new THREE.AmbientLight(0x606060); // soft white light

        var waterGeometry = new THREE.PlaneBufferGeometry(10000, 10000, 1, 1);
        var waterMaterial = new THREE.MeshLambertMaterial({ color: 0x0000ff });
        var water = new THREE.Mesh(waterGeometry, waterMaterial);
        water.position.y -= 0.5;
        water.rotation.x -= Math.PI / 2;

        var skyboxGeometry = new THREE.BoxGeometry(10000, 10000, 10000);
        var skyboxMaterial = new THREE.MeshBasicMaterial({ color: 0x9999ff, side: THREE.DoubleSide });
        var skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);

        WarGame.UI.Plotter.renderer = new THREE.WebGLRenderer();
        WarGame.UI.Plotter.renderer.setSize(dims.width, dims.height);
        WarGame.UI.Plotter.renderer.shadowMapEnabled = true;

        WarGame.UI.Plotter.controls = new THREE.OrbitControls(WarGame.UI.Plotter.camera, WarGame.UI.Plotter.renderer.domElement);
        WarGame.UI.Plotter.controls.addEventListener('change', function () { WarGame.UI.Plotter.render(); });
        // WarGame.UI.Plotter.controls.minDistance = 20;
        // WarGame.UI.Plotter.controls.maxDistance = 1000;
        // WarGame.UI.Plotter.controls.minPolarAngle = Math.PI / 2;
        // WarGame.UI.Plotter.controls.maxPolarAngle = Math.PI - (Math.PI * 0.1);
        // WarGame.UI.Plotter.controls.minAzimuthAngle = -Math.PI / 2 + (Math.PI * 0.1);
        // WarGame.UI.Plotter.controls.maxAzimuthAngle = Math.PI / 2 - (Math.PI * 0.1);

        WarGame.UI.getPlayField().appendChild(WarGame.UI.Plotter.renderer.domElement);

        WarGame.UI.Plotter.scene.add(WarGame.UI.Plotter.lights);
        WarGame.UI.Plotter.scene.add(WarGame.UI.Plotter.camera);
        WarGame.UI.Plotter.scene.add(ambientLight);
        WarGame.UI.Plotter.scene.add(skybox);
        WarGame.UI.Plotter.scene.add(water);

        // var axisHelper = new THREE.AxisHelper(50);
        // WarGame.UI.Plotter.scene.add(axisHelper);

        WarGame.UI.Plotter.render();

        WarGame.UI.Plotter.raycaster = new THREE.Raycaster();
        WarGame.UI.Plotter.mouse = new THREE.Vector2();

        window.addEventListener('resize', WarGame.UI.Plotter.resize, false);
    },

    getWidthHeight: function () {
        return { width: WarGame.UI.getPlayField().offsetWidth, height: WarGame.UI.getPlayField().offsetHeight };
    },

    resize: function () {
        var dims = WarGame.UI.Plotter.getWidthHeight();
        try {
            WarGame.UI.Plotter.camera.aspect = dims.width / dims.height;
            WarGame.UI.Plotter.camera.updateProjectionMatrix();
            WarGame.UI.Plotter.renderer.setSize(dims.width, dims.height);
            WarGame.UI.Plotter.controls.handleResize();
        } catch (e) {
            // TODO: log
        }
    },

    render: function () {
        // WarGame.UI.Plotter.lights.rotateOnAxis(new THREE.Vector3(1,0,0), WarGame.UI.Plotter.timeStep);
        WarGame.UI.Plotter.lights.rotation.z += WarGame.UI.Plotter.timeStep;
        if (WarGame.UI.Plotter.lights.rotation.z > 6.27) {
            WarGame.UI.Plotter.lights.rotation.z = 0;
        }
        WarGame.UI.Plotter.renderer.render(WarGame.UI.Plotter.scene, WarGame.UI.Plotter.camera);
    },

    reset: function () {
        WarGame.UI.getPlayField().removeChild(WarGame.UI.Plotter.renderer.domElement);
        WarGame.UI.Plotter.scene = null;
        WarGame.UI.Plotter.camera = null;
        WarGame.UI.Plotter.lights = null;
        WarGame.UI.Plotter.renderer = null;
        WarGame.UI.Plotter.initialize();
    },

    addMesh: function (mesh) {
        WarGame.UI.Plotter.scene.add(mesh);
    },

    removeMesh: function (mesh) {
        WarGame.UI.Plotter.scene.remove(mesh);
    },

    addListener: function (type, fn) {
        WarGame.UI.Plotter.renderer.domElement.addEventListener(type, fn, false);
    },

    removeListener: function (type, fn) {
        WarGame.UI.Plotter.renderer.domElement.removeEventListener(type, fn, false);
    },
};
