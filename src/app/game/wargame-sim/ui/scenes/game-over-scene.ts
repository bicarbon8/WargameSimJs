import { environment } from "src/environments/environment";

export const GameOverSceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: 'game-over-scene'
} as const;

export class GameOverScene extends Phaser.Scene {
    constructor(settingsConfig?: Phaser.Types.Scenes.SettingsConfig) {
        super(settingsConfig || GameOverSceneConfig);
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
        this._setupCamera();
    }

    update(time: number, delta: number): void {
        
    }

    private _setupCamera(): void {
        this.cameras.main.backgroundColor.setFromRGB({r: 0, g: 0, b: 0});
        this.cameras.main.setZoom(1);
        this.cameras.main.centerOn(0, 0);
    }
}