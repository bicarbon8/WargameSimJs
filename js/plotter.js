var Plotter = {
    scene: null,
    camera: null,
    lights: null,
    renderer: null,
    field: null,
    timeStep: 0.001,

    initialize: function () {
        Plotter.field = document.querySelector('#playfield');
        var dims = Plotter.getWidthHeight();

        Plotter.scene = new THREE.Scene();
        Plotter.scene.fog = new THREE.FogExp2(0xffffff, 0.00015);

        Plotter.camera = new THREE.PerspectiveCamera(45, dims.width / dims.height, 0.1, 100000);
        Plotter.camera.position.set(0, -100, 100);
        Plotter.camera.lookAt(Plotter.scene.position);

        Plotter.lights = new THREE.Object3D();
        for (var i=-20; i<30; i+=40) {
            for (var j=-20; j<30; j+=40) {
                var sunLight = new THREE.SpotLight(0xFFFF44, 0.25, 0, Math.PI / 2, 1); // orange light
                sunLight.castShadow = true;
                sunLight.shadowCameraNear = 100;
                sunLight.shadowCameraFar = 1100;
                // sunLight.shadowCameraVisible = true;
                sunLight.shadowBias = 0.0001;
                sunLight.shadowDarkness = 0.5;
                sunLight.shadowMapWidth = 2048;
                sunLight.shadowMapHeight = 2048;
                sunLight.position.set(i, j, 600);

                var moonLight = new THREE.PointLight(0x3333FF, 0.25, 0, Math.PI / 2, 1); // blue light
                moonLight.position.set(i, j, -600);

                Plotter.lights.add(sunLight);
                Plotter.lights.add(moonLight);
            }
        }

        var ambientLight = new THREE.AmbientLight(0x606060); // soft white light

        var waterGeometry = new THREE.PlaneGeometry(10000, 10000, 1, 1);
        var waterMaterial = new THREE.MeshLambertMaterial({ color: 0x0000ff });
        var water = new THREE.Mesh(waterGeometry, waterMaterial);
        water.position.z -= 0.5;

        var skyboxGeometry = new THREE.BoxGeometry(10000, 10000, 10000);
        var skyboxMaterial = new THREE.MeshBasicMaterial({ color: 0x9999ff, side: THREE.DoubleSide });
        var skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);

        Plotter.renderer = new THREE.WebGLRenderer();
        Plotter.renderer.setSize(dims.width, dims.height);
        Plotter.renderer.shadowMapEnabled = true;

        Plotter.controls = new THREE.OrbitControls(Plotter.camera);
        Plotter.controls.damping = 0.2;
        Plotter.controls.addEventListener('change', function () { Plotter.render(); });
        // Plotter.controls.minDistance = 20;
        // Plotter.controls.maxDistance = 1000;
        // Plotter.controls.minPolarAngle = Math.PI / 2;
        // Plotter.controls.maxPolarAngle = Math.PI - (Math.PI * 0.1);
        // Plotter.controls.minAzimuthAngle = -Math.PI / 2 + (Math.PI * 0.1);
        // Plotter.controls.maxAzimuthAngle = Math.PI / 2 - (Math.PI * 0.1);

        Plotter.field.appendChild(Plotter.renderer.domElement);

        Plotter.scene.add(Plotter.lights);
        Plotter.scene.add(Plotter.camera);
        Plotter.scene.add(ambientLight);
        Plotter.scene.add(skybox);
        Plotter.scene.add(water);

        Plotter.render();
    },

    getWidthHeight: function () {
        return { width: Plotter.field.offsetWidth, height: Plotter.field.offsetHeight };
    },

    render: function () {
        Plotter.lights.rotateOnAxis(new THREE.Vector3(0,1,0), Plotter.timeStep);
        if (Plotter.lights.rotation.y > 6.27) {
            Plotter.lights.rotation.y = 0;
        }
        Plotter.renderer.render(Plotter.scene, Plotter.camera);
    },
};
