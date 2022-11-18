import * as Phaser from "phaser";
import { GameOverScene } from "./scenes/game-over-scene";
import { GameplayScene } from './scenes/gameplay-scene';
import { OverlayScene } from "./scenes/overlay-scene";
import { PickTeamsScene } from "./scenes/pick-teams-scene";
import { HasLocation } from "./types/has-location";
import { UIManagerOptions } from './ui-manager-options';

export class UIManager {
    private readonly _conf: Phaser.Types.Core.GameConfig;
    private _game: Phaser.Game;

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
            roundPixels: true,
            scene: [PickTeamsScene, GameplayScene, OverlayScene, GameOverScene]
        };
    }

    get width(): number {
        return this.game?.canvas?.width || +this._conf.width;
    }

    get height(): number {
        return this.game?.canvas?.height || +this._conf.height;
    }

    get game(): Phaser.Game {
        return this._game;
    }

    get now(): number {
        return this.gameplayScene?.time.now;
    }

    get gameplayScene(): GameplayScene {
        return this.game.scene.getScene('gameplay-scene') as GameplayScene;
    }

    get overlayScene(): OverlayScene {
        return this.game.scene.getScene('overlay-scene') as OverlayScene;
    }

    start(): UIManager {
        this._game = new Phaser.Game(this._conf);
        window.addEventListener('resize', () => {
            this.game.canvas.width = +this._conf.width || window.innerWidth;
            this.game.canvas.height = +this._conf.height || window.innerHeight * 0.8;
            this.game?.scale.refresh();
        });
        return this;
    }

    destroy(): void {
        this.game?.destroy(true, true);
    }

    pointerToWorld(location: HasLocation): Phaser.Math.Vector2 {
        return this.gameplayScene?.cameras.main.getWorldPoint(location.x, location.y) || new Phaser.Math.Vector2(location.x, location.y);
    }
}