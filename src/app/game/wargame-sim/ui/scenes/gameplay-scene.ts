import { environment } from "src/environments/environment";
import { InputController } from "../controllers/input-controller";
import { KBMController } from "../controllers/kbm-controller";
import { WarGame } from "../../war-game";
import { IPlayer } from "../../players/i-player";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: 'gameplay-scene'
};

export class GameplayScene extends Phaser.Scene {
    private _controller: InputController;
    
    constructor(settingsConfig?: Phaser.Types.Scenes.SettingsConfig) {
        super(settingsConfig || sceneConfig);
    }

    preload(): void {
        this.load.image('map-tiles', `${environment.baseUrl}/assets/tiles/ground-tiles.png`);
        this.load.image('border-tiles', `${environment.baseUrl}/assets/tiles/metaltiles.png`);
        this.load.spritesheet('players', `${environment.baseUrl}/assets/sprites/player/sprite.png`, {
            frameWidth: 32,
            frameHeight: 32,
            startFrame: 0,
            endFrame: 96
        }); // 12w by 8h
    }

    create(): void {
        WarGame.mapMgr.createMap(this).obj;
        this._setupCamera();
        this._setupController();
        this._setupPointerHandling();

        WarGame.uiMgr.game.scene.start('overlay-scene');
        WarGame.uiMgr.game.scene.bringToTop('overlay-scene');
        
        this.input.on(Phaser.Input.Events.POINTER_DOWN, (pointer: Phaser.Input.Pointer) => {
            let world: Phaser.Math.Vector2 = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
            console.info(`screen: ${pointer.x.toFixed(0)},${pointer.y.toFixed(0)}; world: ${world.x.toFixed(0)},${world.y.toFixed(0)}; zoom: ${this.cameras.main.zoom.toFixed(1)}`);
        });
    }

    update(time: number, delta: number): void {
        this._controller.update(time, delta);
    }

    private _setupCamera(): void {
        this.cameras.main.setBackgroundColor(0x0066ff);
        this.cameras.main.setZoom(1);
        this.cameras.main.centerOn(0, 0);
    }

    private _setupController(): void {
        this._controller = new KBMController(this);
    }

    private _setupPointerHandling(): void {
        const placementPhaserActive = () => WarGame.phaseMgr.placementPhase.active;
        WarGame.mapMgr.map.obj
            .on(Phaser.Input.Events.POINTER_MOVE, (p: Phaser.Input.Pointer) => {
                if (placementPhaserActive()) {
                    WarGame.phaseMgr.placementPhase.highlightTiles(p);
                }
            }).on(Phaser.Input.Events.POINTER_OUT, (p: Phaser.Input.Pointer) => {
                if (placementPhaserActive()) {
                    WarGame.phaseMgr.placementPhase.clearHighlightedTiles(p);
                }
            }).on(Phaser.Input.Events.POINTER_DOWN, (p: Phaser.Input.Pointer) => {
                if (placementPhaserActive()) {
                    WarGame.phaseMgr.placementPhase.placeTeam(p);
                }
            });
        const movementPhaseActive = () => WarGame.phaseMgr.movementPhase.active;
        WarGame.mapMgr.map.obj
            .on(Phaser.Input.Events.POINTER_UP, (p: Phaser.Input.Pointer) => {
                if (movementPhaseActive()) {
                    WarGame.phaseMgr.movementPhase.handleMapUp(p);
                }
            });
        const shootingPhaseActive = () => WarGame.phaseMgr.shootingPhase.active;
        WarGame.teamMgr.playerManager.players.forEach((p: IPlayer) => {
            p?.obj.on(Phaser.Input.Events.POINTER_DOWN, (p: Phaser.Input.Pointer) => {
                if (movementPhaseActive()) {
                    WarGame.phaseMgr.movementPhase.handlePlayerDown(p);
                }
                if (shootingPhaseActive()) {
                    WarGame.phaseMgr.shootingPhase.handlePlayerDown(p);
                }
            });
        });
    }
}