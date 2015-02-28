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
        Plotter.scene.fog = new THREE.FogExp2(0x808080, 0.001);

        Plotter.camera = new THREE.PerspectiveCamera(45, dims.width / dims.height, 0.1, 100000);
        Plotter.camera.position.set(0, 200, 200);
        Plotter.camera.lookAt(Plotter.scene.position);

        var sunLight = new THREE.SpotLight(0xFFFF44, 3); // orange light
        sunLight.castShadow = true;
        sunLight.shadowCameraNear = 0;
        sunLight.shadowCameraFar = 100000;
        sunLight.position.set(0, 50, 400);
        var moonLight = new THREE.SpotLight(0x0000FF, 2); // blue light
        moonLight.castShadow = true;
        moonLight.shadowCameraFar = 100000;
        moonLight.position.set(0, -50, -400);
        var ambientLight = new THREE.AmbientLight(0x202020); // soft white light
        Plotter.moon = moonLight;
        Plotter.lights = new THREE.Object3D();
        Plotter.lights.add(sunLight);
        Plotter.lights.add(moonLight);

        var skyboxGeometry = new THREE.BoxGeometry(10000, 10000, 10000);
        var skyboxMaterial = new THREE.MeshBasicMaterial({ color: 0x9999ff, side: THREE.DoubleSide });
        var skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);

        Plotter.renderer = new THREE.WebGLRenderer();
        Plotter.renderer.setSize(dims.width, dims.height);

        Plotter.controls = new THREE.OrbitControls(Plotter.camera);
        Plotter.controls.damping = 0.2;
        Plotter.controls.addEventListener('change', function () { Plotter.render(); });
        // Plotter.controls.minDistance = 20;
        // Plotter.controls.maxDistance = 500;
        // Plotter.controls.minPolarAngle = Math.PI / 2;
        // Plotter.controls.maxPolarAngle = Math.PI - (Math.PI * 0.1);
        // Plotter.controls.minAzimuthAngle = -Math.PI / 2 + (Math.PI * 0.1);
        // Plotter.controls.maxAzimuthAngle = Math.PI / 2 - (Math.PI * 0.1);

        Plotter.field.appendChild(Plotter.renderer.domElement);

        Plotter.scene.add(Plotter.lights);
        Plotter.scene.add(Plotter.camera);
        Plotter.scene.add(ambientLight);
        Plotter.scene.add(skybox);

        Plotter.render();
    },

    getWidthHeight: function () {
        return { width: Plotter.field.offsetWidth, height: Plotter.field.offsetHeight };
    },

    render: function () {
        Plotter.lights.rotation.y += Plotter.timeStep;
        Plotter.renderer.render(Plotter.scene, Plotter.camera);
    },
};
