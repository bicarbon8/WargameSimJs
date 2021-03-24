import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { PhaseManager } from '../phases/phase-manager';
import { PhaseType } from '../phases/phase-type';
import { ViewSize } from './view-size';

export class ViewManager {
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    lights: THREE.Object3D;
    renderer: THREE.WebGLRenderer;
    readonly timeStep: number = 0.00001;
    raycaster: THREE.Raycaster;
    mousePos: THREE.Vector2;
    controls: OrbitControls;

    private readonly _phaseMgr: PhaseManager;

    constructor(phaseMgr?: PhaseManager) {
        this._phaseMgr = phaseMgr || PhaseManager.inst;
    }

    init(playfield: HTMLCanvasElement): void {
        var dims = this.getWidthHeight();

        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0xffffff, 0.015);

        this.camera = new THREE.PerspectiveCamera(45, dims.width / dims.height, 0.1, 100000);
        this.camera.position.set(0, 50, 50);
        this.camera.lookAt(this.scene.position);

        this.lights = new THREE.Object3D();
        for (var i=-20; i<30; i+=40) {
            for (var j=-20; j<30; j+=40) {
                var sunLight = new THREE.PointLight(0xFFFF44, 0.2, Math.PI / 2, 1); // orange light
                sunLight.position.set(i, 600, j);

                var moonLight = new THREE.PointLight(0x3333FF, 0.25, Math.PI / 2, 1); // blue light
                moonLight.position.set(i, -600, j);

                this.lights.add(sunLight);
                this.lights.add(moonLight);
            }
        }
        var sunShadowLight = new THREE.SpotLight(0xFFFF44, 0.2, 0, Math.PI / 2, 1);
        sunShadowLight.castShadow = true;
        sunShadowLight.shadow.camera.near = 100;
        sunShadowLight.shadow.camera.far = 1100;
        // sunShadowLight.shadowCameraVisible = true;
        sunShadowLight.shadow.bias = 0.0001;
        // sunShadowLight.shadowDarkness = 0.75;
        sunShadowLight.shadow.mapSize.width = 2048;
        sunShadowLight.shadow.mapSize.height = 2048;
        sunShadowLight.position.set(0, 600, 0);
        this.lights.add(sunShadowLight);

        var ambientLight = new THREE.AmbientLight(0x606060); // soft white light

        var waterGeometry = new THREE.PlaneBufferGeometry(10000, 10000, 1, 1);
        var waterMaterial = new THREE.MeshLambertMaterial({ color: 0x0000ff });
        var water = new THREE.Mesh(waterGeometry, waterMaterial);
        water.position.y -= 0.5;
        water.rotation.x -= Math.PI / 2;

        var skyboxGeometry = new THREE.BoxGeometry(10000, 10000, 10000);
        var skyboxMaterial = new THREE.MeshBasicMaterial({ color: 0x9999ff, side: THREE.DoubleSide });
        var skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);

        this.renderer = new THREE.WebGLRenderer({canvas: playfield});
        this.renderer.setSize(dims.width, dims.height);
        this.renderer.shadowMap.enabled = true;

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.addEventListener('change', () => this.render());
        // controls.minDistance = 20;
        // controls.maxDistance = 1000;
        // controls.minPolarAngle = Math.PI / 2;
        // controls.maxPolarAngle = Math.PI - (Math.PI * 0.1);
        // controls.minAzimuthAngle = -Math.PI / 2 + (Math.PI * 0.1);
        // controls.maxAzimuthAngle = Math.PI / 2 - (Math.PI * 0.1);

        this.scene.add(this.lights);
        this.scene.add(this.camera);
        this.scene.add(ambientLight);
        this.scene.add(skybox);
        this.scene.add(water);

        // var axisHelper = new THREE.AxisHelper(50);
        // scene.add(axisHelper);

        this.render();

        this.raycaster = new THREE.Raycaster();
        this.mousePos = new THREE.Vector2();

        window.addEventListener('resize', this.resize, false);
        this.createMenusContainer();
    }

    async displayAlert(message, type): Promise<void> {
        setTimeout(function () {
            if (!type) {
                type = this.ALERT_INFO;
            }
            var alertsContainer = this.getAlertsContainer();
            var alertId = this.COUNTER++;
            alertsContainer.innerHTML = '<div id="alert-' + alertId + '" class="alert ' + type + '" role="alert" style="display: none;">' +
                message + '</div>' + alertsContainer.innerHTML;
            $("#alert-" + alertId).fadeIn(100, function () {
                $("#alert-" + alertId).delay(5000).fadeOut(1000, function () {
                    $("#alert-" + alertId).remove();
                });
            });
        }, 0);
    }
  
    async displayDefeatedAlert(player): Promise<void> {
        setTimeout(function () {
            this.displayAlert(player.team.name + ' - ' + player.name + ' defeated!', this.ALERT_BAD);
        }, 0);
    }
  
    async getAlertsContainer(): Promise<HTMLElement> {
        var alertsContainer: HTMLElement;
        try {
            alertsContainer = document.querySelector<HTMLElement>('#alertsContainer');
            if (!alertsContainer) {
                throw 'does not exist';
            }
        } catch (e) {
            this.createAlertsContainer();
            alertsContainer = document.querySelector('#alertsContainer');
        }
        return alertsContainer;
    }
  
    async createAlertsContainer(): Promise<void> {
        var alertsContainer: HTMLElement = document.createElement('div');
        alertsContainer.setAttribute("id", 'alertsContainer');
  
        var container = document.querySelector('#middle');
        container.insertBefore(alertsContainer, container.firstChild);
    }
  
    async getMenusContainer(): Promise<HTMLElement> {
        var menusContainer: HTMLElement;
        try {
            menusContainer = document.querySelector('#menusContainer');
            if (!menusContainer) {
                throw 'does not exist';
            }
        } catch (e) {
            this.createAlertsContainer();
            menusContainer = document.querySelector('#menusContainer');
        }
        return menusContainer;
    }
  
    async createMenusContainer(): Promise<void> {
        var menusContainer = document.createElement('div');
        menusContainer.setAttribute('id', 'menusContainer');
        menusContainer.className = 'container-fluid';
        menusContainer.innerHTML = '' +
  '<div class="row-fluid">' +
  '<div id="left" class="col-xs-3"></div>' +
  '<div id="middle" class="col-xs-6"></div>' +
  '<div id="right" class="col-xs-3"></div>' +
  '</div>';
  
        // this._playfield.insertBefore(menusContainer, this._playfield.firstChild);
    }
  
    async removeMenusContainer(): Promise<void> {
        var menusContainer = document.querySelector<HTMLElement>('#menusContainer');
        // this._playfield.removeChild(menusContainer);
    }
  
    async getPhaseContainers(): Promise<HTMLElement[]> {
        var phases: HTMLElement[] = [];
        var p = document.querySelector<HTMLElement>('#priorityRow');
        if (!p) {
            var parentElement: HTMLElement;
            // TODO: support phase containers for each team
            parentElement = document.querySelector<HTMLElement>('#left');
            this.createPhaseContainers(parentElement);
            p = document.querySelector<HTMLElement>('#priorityRow');
            phases.push(p);
        }
        phases.push(document.querySelector('#moveRow'));
        phases.push(document.querySelector('#shootRow'));
        phases.push(document.querySelector('#fightRow'));
  
        return phases;
    }
  
    async createPhaseContainers(parentElement: HTMLElement): Promise<void> {
        for (var i=0; i<this._phaseMgr.getNumberOfPhases(); i++) {
            var pc: HTMLDivElement = document.createElement('div');
            pc.className = 'row-fluid';
            switch (i) {
                case PhaseType.priority:
                    pc.setAttribute('id', 'priorityRow');
                    pc.innerHTML = '' +
                    '<h3><span id="currentTeam" class="label label-default">loading...</span> ' +
                    '<span id="currentPhase" class="label label-default">loading...</span></h3>';
                    break;
                case PhaseType.movement:
                    pc.setAttribute('id', 'moveRow');
                    break;
                case PhaseType.shooting:
                    pc.setAttribute('id', 'shootRow');
                    break;
                case PhaseType.fighting:
                    pc.setAttribute('id', 'fightRow');
                    break;
            }
            parentElement.appendChild(pc);
        }
    }
  
    async removePhaseContainers(): Promise<void> {
        this.setContents('left', '');
        this.setContents('right', '');
    }
  
    async setCurrentPhaseText(phaseName: string): Promise<void> {
        this.setContents('currentPhase', phaseName);
    }
  
    async setCurrentTeamText(teamName: string): Promise<void> {
        this.removePhaseContainers();
        var phases: HTMLElement[] = await this.getPhaseContainers();
        this.setContents('currentTeam', teamName);
        this.setCurrentPhaseText(PhaseType[this._phaseMgr.getCurrentPhase().getType()]);
    }
  
    async setContents(containerId: string, contentsStr: string): Promise<void> {
        document.querySelector('#' + containerId).innerHTML = contentsStr;
    }
  
    async getContents(containerId: string): Promise<string> {
        return document.querySelector('#' + containerId)?.innerHTML;
    }
  
    async setValue(fieldId: string, valueStr: string): Promise<void> {
        document.querySelector<HTMLInputElement>('#' + fieldId).value = valueStr;
    }
  
    async getValue(fieldId: string): Promise<string> {
        return document.querySelector<HTMLInputElement>('#' + fieldId)?.value;
    }

    getWidthHeight(): ViewSize {
        return { width: window.innerWidth, height: window.innerHeight };
    }

    resize(): void {
        var dims = this.getWidthHeight();
        try {
            this.camera.aspect = dims.width / dims.height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(dims.width, dims.height);
            this.controls.update();
        } catch (e) {
            // TODO: log
        }
    }

    render(): void {
        // lights.rotateOnAxis(new THREE.Vector3(1,0,0), timeStep);
        this.lights.rotation.z += this.timeStep;
        if (this.lights.rotation.z > 6.27) {
            this.lights.rotation.z = 0;
        }
        this.renderer.render(this.scene, this.camera);
    }

    reset(playfield: HTMLCanvasElement): void {
        this.removeMenusContainer();
        this.scene = null;
        this.camera = null;
        this.lights = null;
        this.renderer = null;
        this.init(playfield);
    }

    addMesh(mesh): void {
        this.scene.add(mesh);
    }

    removeMesh(mesh): void {
        this.scene.remove(mesh);
    }

    addListener(type, fn): void {
        this.renderer.domElement.addEventListener(type, fn, false);
    }

    removeListener(type, fn): void {
        this.renderer.domElement.removeEventListener(type, fn, false);
    }
}

export module ViewManager {
    export var inst = new ViewManager();
}