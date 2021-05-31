import { PhaseManager } from '../phases/phase-manager';
import { PhaseType } from '../phases/phase-type';
import { ViewSize } from './view-size';
namespace THREE {
    export class Scene {fog: FogExp2; position: any;}
    export class PerspectiveCamera {constructor(a: any, b: any, c: any, d: any) {} position: any; lookAt(a: any) {}}
    export class Object3D {add(a: any) {}}
    export class WebGLRenderer {render(a: any, b: any) {}}
    export class Raycaster {}
    export class Vector2 {}
    export class FogExp2 {constructor(hex: any, float: any) {}}
    export class PointLight {constructor(a: any, b: any, c: any, d: any) {} position: any;}
    export class SpotLight {constructor(a: any, b: any, c: any, d: any, e: any) {}}
}
class OrbitControls {}
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
        // this.camera.position.set(0, 50, 50);
        // this.camera.lookAt(this.scene.position);

        this.lights = new THREE.Object3D();
        for (var i=-20; i<30; i+=40) {
            for (var j=-20; j<30; j+=40) {
                var sunLight = new THREE.PointLight(0xFFFF44, 0.2, Math.PI / 2, 1); // orange light
                // sunLight.position.set(i, 600, j);

                // var moonLight = new THREE.PointLight(0x3333FF, 0.25, Math.PI / 2, 1); // blue light
                // moonLight.position.set(i, -600, j);

                // this.lights.add(sunLight);
                // this.lights.add(moonLight);
            }
        }
        var sunShadowLight = new THREE.SpotLight(0xFFFF44, 0.2, 0, Math.PI / 2, 1);
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
            
        } catch (e) {
            // TODO: log
        }
    }

    render(): void {
        // lights.rotateOnAxis(new THREE.Vector3(1,0,0), timeStep);
        // this.renderer.render(this.scene, this.camera);
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
        // this.scene.add(mesh);
    }

    removeMesh(mesh): void {
        // this.scene.remove(mesh);
    }

    addListener(type, fn): void {
        // this.renderer.domElement.addEventListener(type, fn, false);
    }

    removeListener(type, fn): void {
        // this.renderer.domElement.removeEventListener(type, fn, false);
    }
}

export module ViewManager {
    export var inst = new ViewManager();
}