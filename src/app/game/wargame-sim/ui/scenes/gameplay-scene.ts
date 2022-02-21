const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: 'GameplayScene'
};

export class GameplayScene extends Phaser.Scene {
    constructor(settingsConfig?: Phaser.Types.Scenes.SettingsConfig) {
        super(settingsConfig || sceneConfig);
    }

    preload(): void {
        this.load.image('grass-texture', './assets/sprites/map-tiles/grass-texture-2.jpg');
        this.load.spritesheet('players', './assets/sprites/player/sprite.png', {
            frameWidth: 130,
            frameHeight: 132,
            startFrame: 0,
            endFrame: 4
        }); // 12w by 8h
    }

    create(): void {
        this._setupCamera();
    }

    update(time: number, delta: number): void {
        
    }

    private _setupCamera(): void {
        this.cameras.main.backgroundColor.setFromRGB({r: 255, g: 255, b: 255});
        this.cameras.main.setZoom(1);
        this.cameras.main.centerOn(0, 0);
    }
}