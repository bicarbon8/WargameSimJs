import { WarGameMap } from "../map/war-game-map";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: true,
    visible: true,
    key: 'GameplayScene'
};

export class GameplayScene extends Phaser.Scene {
    private _map: WarGameMap;

    constructor(settingsConfig?: Phaser.Types.Scenes.SettingsConfig) {
        let conf: Phaser.Types.Scenes.SettingsConfig = settingsConfig || sceneConfig;
        super(conf);
    }

    preload(): void {
        // this.load.image('ship-pod', './assets/sprites/ship-pod.png');
        // this.load.spritesheet('flares', './assets/particles/flares.png', {
        //     frameWidth: 130,
        //     frameHeight: 132,
        //     startFrame: 0,
        //     endFrame: 4
        // });
    }

    create(): void {
        this._createPlayers();
        this._createMap();

        this._setupCamera();
    }

    update(time: number, delta: number): void {
        
    }

    private _createPlayers(): void {
        
    }

    private _createMap(): void {
        this._map = new WarGameMap([]);
    }

    private _setupCamera(): void {
        this.cameras.main.backgroundColor.setFromRGB({r: 255, g: 255, b: 255});
        this.cameras.main.setZoom(1);
        this.cameras.main.centerOn(0, 0);
    }
}