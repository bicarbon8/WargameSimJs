import { environment } from "src/environments/environment";
import { InputController } from "../controllers/input-controller";
import { KBMController } from "../controllers/kbm-controller";
import { WarGame } from "../../war-game";
import { OverlaySceneConfig } from "./overlay-scene";

export const GameplaySceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: 'gameplay-scene'
} as const;

export class GameplayScene extends Phaser.Scene {
    private _controller: InputController;
    
    constructor(settingsConfig?: Phaser.Types.Scenes.SettingsConfig) {
        super(settingsConfig || GameplaySceneConfig);
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

        WarGame.uiMgr.game.scene.start(OverlaySceneConfig.key);
        WarGame.uiMgr.game.scene.bringToTop(OverlaySceneConfig.key);

        WarGame.phaseMgr.startCurrentPhase();
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
}