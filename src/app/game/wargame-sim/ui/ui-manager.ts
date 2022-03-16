import * as Phaser from "phaser";
import { GameplayScene } from './scenes/gameplay-scene';
import { OverlayScene } from "./scenes/overlay-scene";
import { PickTeamsScene } from "./scenes/pick-teams-scene";
import { UIManagerOptions } from './ui-manager-options';

export class UIManager {
    private readonly _conf: Phaser.Types.Core.GameConfig;
    private _game: Phaser.Game;
    private _view: Phaser.Geom.Rectangle;

    constructor(options?: UIManagerOptions) {
        this._conf = {
            type: Phaser.AUTO,
            width: options?.width || window.innerWidth,
            height: options?.height || window.innerHeight * 0.8,
            scale: {
                mode: Phaser.Scale.NONE,
                autoCenter: Phaser.Scale.NONE
            },
            backgroundColor: '#ffffff',
            parent: options?.parentElementId || 'playfield',
            physics: {
                default: 'arcade',
                arcade: {
                    debug: (options?.debug) ? true : false,
                    gravity: { x: 0, y: 0 },
                }
            },
            dom: {
                createContainer: true
            },
            roundPixels: true,
            scene: [PickTeamsScene, GameplayScene, OverlayScene]
        };
    }

    get width(): number {
        return this.game?.canvas?.width || +this._conf.width;
    }

    get height(): number {
        return this.game?.canvas?.height || +this._conf.height;
    }

    /**
     * returns a `Phaser.Geom.Rectangle` representing
     * the current viewable area.
     * 
     * NOTE: this CAN NOT be used during scene creation
     * and instead you should use `this.scene.cameras.main.worldView`
     */
    get view(): Phaser.Geom.Rectangle {
        return this.scene?.cameras.main.worldView;
    }

    get game(): Phaser.Game {
        return this._game;
    }

    /**
     * gets the currently active Scene
     */
    get scene(): Phaser.Scene {
        return this.game.scene.getScenes(true)?.shift();
    }

    start(): UIManager {
        this._game = new Phaser.Game(this._conf);
        window.addEventListener('resize', () => {
            this._view = null;
            this.game.canvas.width = +this._conf.width || window.innerWidth;
            this.game.canvas.height = +this._conf.height || window.innerHeight * 0.8;
            this.game?.scale.refresh();
        });
        document.addEventListener("visibilitychange", () => {
            this.game?.scene.pause(this.scene);
        }, false);
        return this;
    }

    destroy(): void {
        this.game?.destroy(true, true);
    }

    pointerToWorld(x: number, y: number): Phaser.Math.Vector2 {
        return this.scene?.cameras.main.getWorldPoint(x, y) || new Phaser.Math.Vector2(x, y);
    }
}